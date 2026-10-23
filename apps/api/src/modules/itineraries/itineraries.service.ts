import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertItineraryDto, CloneTemplateDto } from './dto/itinerary.dto';
import OpenAI from 'openai';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import puppeteer from 'puppeteer';
import { StorageService } from '../storage/storage.service';
import { WhatsappSenderService } from '../whatsapp/whatsapp-sender.service';
import { ItineraryTemplate } from './templates/ItineraryTemplate';

@Injectable()
export class ItinerariesService {
  constructor(
    private prisma: PrismaService, 
    private storageService: StorageService,
    private whatsappService: WhatsappSenderService
  ) {}

  async getItinerary(tenantId: string, bookingId: string) {
    return this.prisma.itinerary.findUnique({
      where: { bookingId, tenantId },
      include: {
        days: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  async cloneTemplate(tenantId: string, bookingId: string, userId: string, dto: CloneTemplateDto) {
    // 1. Verify template exists
    const template = await this.prisma.packageItineraryTemplate.findUnique({
      where: { id: dto.templateId, tenantId },
      include: { templateDays: true }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    const travelDate = booking?.travelDate ? new Date(booking.travelDate) : null;

    // 2. Delete existing itinerary if it exists
    await this.prisma.itinerary.deleteMany({
      where: { bookingId, tenantId }
    });

    // 3. Create itinerary and days using transaction
    const publicSlug = `itinerary-${Math.random().toString(36).substring(2, 10)}`;

    return this.prisma.itinerary.create({
      data: {
        tenantId,
        bookingId,
        title: template.title,
        publicSlug,
        generatedBy: 'template',
        templateId: template.id,
        createdBy: userId,
        days: {
          create: template.templateDays.map(day => {
            let dayDate = null;
            if (travelDate) {
              dayDate = new Date(travelDate);
              dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));
            }
            return {
              tenantId,
              dayNumber: day.dayNumber,
              date: dayDate,
              title: day.title,
              description: day.description,
              activities: day.activities || [],
              sortOrder: day.sortOrder
            };
          })
        }
      },
      include: { days: true }
    });
  }

  async upsertItinerary(tenantId: string, bookingId: string, userId: string, dto: UpsertItineraryDto) {
    return this.prisma.$transaction(async (tx) => {
      let itinerary = await tx.itinerary.findUnique({
        where: { bookingId, tenantId }
      });

      if (!itinerary) {
        itinerary = await tx.itinerary.create({
          data: {
            tenantId,
            bookingId,
            title: dto.title,
            publicSlug: dto.publicSlug || `itinerary-${Math.random().toString(36).substring(2, 10)}`,
            generatedBy: dto.generatedBy || 'manual',
            createdBy: userId
          }
        });
      } else {
        itinerary = await tx.itinerary.update({
          where: { id: itinerary.id },
          data: {
            title: dto.title !== undefined ? dto.title : itinerary.title,
            publicSlug: dto.publicSlug !== undefined ? dto.publicSlug : itinerary.publicSlug,
            generatedBy: dto.generatedBy !== undefined ? dto.generatedBy : itinerary.generatedBy
          }
        });
      }

      // Sync days
      const incomingIds = dto.days.map(d => d.id).filter(Boolean);
      
      // Delete days not in the incoming payload
      await tx.itineraryDay.deleteMany({
        where: {
          itineraryId: itinerary.id,
          id: { notIn: incomingIds }
        }
      });

      // Upsert days
      for (const [index, day] of dto.days.entries()) {
        const dayData = {
          dayNumber: day.dayNumber,
          date: day.date ? new Date(day.date) : null,
          title: day.title,
          description: day.description,
          activities: day.activities as any,
          sortOrder: index
        };

        if (day.id) {
          await tx.itineraryDay.update({
            where: { id: day.id },
            data: dayData
          });
        } else {
          await tx.itineraryDay.create({
            data: {
              ...dayData,
              tenantId,
              itineraryId: itinerary.id
            }
          });
        }
      }

      return tx.itinerary.findUnique({
        where: { id: itinerary.id },
        include: {
          days: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    });
  }

  async generateAiItinerary(tenantId: string, bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, tenantId },
      include: {
        package: { include: { packageItems: true } },
        quotation: { include: { quotationItems: true } }
      }
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const durationDays = booking.returnDate 
      ? Math.ceil((new Date(booking.returnDate).getTime() - new Date(booking.travelDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 3; // fallback

    let itemsStr = '';
    if (booking.package?.packageItems?.length) {
      itemsStr = booking.package.packageItems.map(i => `${i.category}: ${i.name} - ${i.description}`).join('\n');
    } else if (booking.quotation?.quotationItems?.length) {
      itemsStr = booking.quotation.quotationItems.map(i => `${i.category}: ${i.name} - ${i.description}`).join('\n');
    }

    try {
      const prompt = `You are an expert travel planner. Create a day-by-day itinerary for a trip to ${booking.destination} for ${durationDays} days. 
Here are some booked items to include:\n${itemsStr}
Respond ONLY with a JSON array of objects. Each object represents a day.
Schema:
[{
  "dayNumber": number,
  "title": string,
  "description": string,
  "activities": [{ "time": "09:00", "icon": "emoji like ✈️ or 🏨", "description": string }]
}]`;

      const openai = new OpenAI({ 
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY 
      });

      const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000
      });
      
      let content = response.choices[0].message.content || '[]';
      if (content.startsWith('```json')) {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      
      let parsedDays;
      try {
        parsedDays = JSON.parse(content);
      } catch (parseErr) {
        // Sometimes AI returns markdown without json tag, strip it
        const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          parsedDays = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON: ' + content);
        }
      }

      if (!Array.isArray(parsedDays)) {
         parsedDays = parsedDays.days || Object.values(parsedDays)[0];
         if (!Array.isArray(parsedDays)) parsedDays = [];
      }

      await this.prisma.aiConversation.create({
        data: {
          tenantId,
          source: 'crm_chat',
          messages: [{ role: 'user', content: prompt }, { role: 'assistant', content: content }],
          tokensUsed: response.usage?.total_tokens || 0,
          model: response.model
        }
      });

      return await this.prisma.$transaction(async (tx) => {
        await tx.itinerary.deleteMany({ where: { bookingId, tenantId } });
        const travelDate = new Date(booking.travelDate);
        const publicSlug = `itinerary-${Math.random().toString(36).substring(2, 10)}`;

        return tx.itinerary.create({
          data: {
            tenantId,
            bookingId,
            title: `Trip to ${booking.destination}`,
            publicSlug,
            generatedBy: 'ai',
            createdBy: userId,
            days: {
              create: parsedDays.map((d: any, index: number) => {
                const dayDate = new Date(travelDate);
                dayDate.setDate(dayDate.getDate() + index);
                
                return {
                  tenantId,
                  dayNumber: index + 1,
                  date: dayDate,
                  title: d.title || `Day ${index + 1}`,
                  description: d.description || '',
                  activities: d.activities || [],
                  sortOrder: index
                };
              })
            }
          },
          include: { days: true }
        });
      });

    } catch (err) {
      console.error('AI Service Error:', err);
      throw new BadRequestException('Failed to generate AI itinerary: ' + (err as any).message);
    }
  }

  async generatePdf(tenantId: string, bookingId: string, itineraryId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId, tenantId },
      include: { 
        days: { orderBy: { sortOrder: 'asc' } }, 
        booking: { include: { customer: true } } 
      }
    });

    if (!itinerary) throw new NotFoundException('Itinerary not found');

    const htmlString = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ItineraryTemplate, { itinerary, booking: itinerary.booking })
    );

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(htmlString, { waitUntil: 'load' });
      
      const pdfBufferArray = await page.pdf({ format: 'A4', printBackground: true });
      const pdfBuffer = Buffer.from(pdfBufferArray);

      await browser.close();

      const fileName = `itinerary-${itinerary.publicSlug}-${Date.now()}.pdf`;
      const pdfUrl = await this.storageService.uploadFile(fileName, pdfBuffer, 'application/pdf');

      return await this.prisma.itinerary.update({
        where: { id: itineraryId },
        data: { pdfUrl }
      });
    } catch (err) {
      throw new BadRequestException('Failed to generate PDF: ' + (err as any).message);
    }
  }

  async sendPdfViaWhatsapp(tenantId: string, bookingId: string, itineraryId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId, tenantId },
      include: { booking: { include: { customer: true } } }
    });

    if (!itinerary || !itinerary.pdfUrl) {
      throw new BadRequestException('Itinerary PDF not found. Please generate it first.');
    }

    const customerPhone = itinerary.booking.customer.phone;
    if (!customerPhone) {
      throw new BadRequestException('Customer does not have a phone number');
    }

    const success = await this.whatsappService.sendDocument(tenantId, customerPhone, {
      link: itinerary.pdfUrl,
      filename: `Itinerary_${itinerary.booking.destination}.pdf`,
      caption: `Hello ${itinerary.booking.customer.name}, here is your travel itinerary for ${itinerary.booking.destination}!`
    });

    if (!success) {
      throw new BadRequestException('Failed to send WhatsApp message');
    }

    return { success: true };
  }
}
