import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const openrouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (openrouterKey) {
      // Use OpenRouter — OpenAI-compatible, supports Claude, Gemini, Llama, etc.
      this.openai = new OpenAI({
        apiKey: openrouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://fellowcrm.app',
          'X-Title': 'Fellow CRM',
        },
      });
      this.logger.log('AI Provider: OpenRouter');
    } else {
      this.openai = new OpenAI({
        apiKey: openaiKey || 'sk-dummy',
      });
      this.logger.log('AI Provider: OpenAI');
    }
  }

  /**
   * Generates a chat completion while strictly enforcing limits and tracking usage per tenant.
   */
  async generateCompletion(
    tenantId: string,
    feature: string,
    messages: any[],
    options: { temperature?: number; response_format?: any } = {}
  ) {
    // 1. Fetch Tenant Limits
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { aiEnabled: true, aiConversationsUsed: true, aiConversationsLimit: true, aiModel: true }
    });

    if (!tenant) throw new BadRequestException('Tenant not found');
    if (!tenant.aiEnabled) {
      throw new ForbiddenException('AI features are not enabled for this tenant. Please upgrade your plan.');
    }
    if (tenant.aiConversationsLimit > 0 && tenant.aiConversationsUsed >= tenant.aiConversationsLimit) {
      throw new ForbiddenException('Monthly AI limit reached. Please upgrade your plan for more usage.');
    }

    // 2. Call OpenAI
    try {
      // If using OpenRouter and no specific model set, default to a free/cheap model
      const openrouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
      const defaultModel = openrouterKey
        ? (tenant.aiModel || 'google/gemini-2.0-flash-exp:free')
        : (tenant.aiModel || 'gpt-4o-mini');

      const response = await this.openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: options.temperature ?? 0.7,
        response_format: options.response_format,
      });

      const message = response.choices[0].message;
      const usage = response.usage;

      // 3. Track Usage in DB (Fire-and-forget for speed)
      if (usage) {
        this.prisma.$transaction([
          this.prisma.tenant.update({
            where: { id: tenantId },
            data: { aiConversationsUsed: { increment: 1 } }
          }),
          this.prisma.aiTokenUsage.create({
            data: {
              tenantId,
              modelName: tenant.aiModel || 'gpt-4o-mini',
              promptTokens: usage.prompt_tokens,
              completionTokens: usage.completion_tokens,
              totalTokens: usage.total_tokens,
              feature,
            }
          })
        ]).catch(err => this.logger.error(`Failed to track AI tokens for tenant ${tenantId}`, err));
      }

      return message;
    } catch (error: any) {
      this.logger.error(`OpenAI Error: ${error.message}`);
      throw new BadRequestException('Failed to process AI request at this time.');
    }
  }

  /**
   * Generates a structured JSON itinerary using package context and natural language preferences.
   */
  async generateItinerary(tenantId: string, preferences: string, packageId?: string) {
    let contextText = '';
    if (packageId) {
      const pkg = await this.prisma.package.findUnique({
        where: { id: packageId, tenantId },
        include: { packageItems: true }
      });
      if (pkg) {
        contextText = `
        PACKAGE CONTEXT:
        Name: ${pkg.name}
        Destination: ${pkg.destination}
        Duration: ${pkg.durationDays} Days / ${pkg.durationNights} Nights
        Description: ${pkg.description || 'None'}
        
        INCLUDED ITEMS (You MUST incorporate these into the day-by-day activities):
        ${pkg.packageItems.map(i => `- [${i.category.toUpperCase()}] ${i.name}: ${i.description || 'No details'}`).join('\n')}
        `;
      }
    }

    const systemPrompt = `You are an expert travel planner. The user will give you a description of a trip and their preferences. 
    You may also be provided with PACKAGE CONTEXT, which includes specific hotels, flights, tours, and activities already booked.
    
    YOUR JOB:
    - Generate a detailed day-by-day itinerary.
    - If PACKAGE CONTEXT is provided, you MUST intelligently distribute those included items across the days (e.g. put the flight on Day 1, put the hotel check-in on Day 1, schedule the tours logically).
    - Fill in the gaps with realistic, highly-rated local suggestions (e.g. good restaurants, leisure spots) that match the destination and user preferences.
    - Keep activity times realistic.
    
    Respond ONLY with a JSON object in this exact structure:
    {
      "title": "String",
      "description": "String",
      "days": [
        {
          "dayNumber": Number,
          "title": "String",
          "description": "String",
          "activities": [
            { "time": "String (e.g. 09:00 AM)", "icon": "Emoji", "description": "String" }
          ]
        }
      ]
    }`;

    const response = await this.generateCompletion(
      tenantId, 
      'itinerary_drafter', 
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `PREFERENCES: ${preferences}\n\n${contextText}` }
      ],
      { response_format: { type: "json_object" }, temperature: 0.8 }
    );

    try {
      if (!response.content) throw new Error("Empty response");
      return JSON.parse(response.content);
    } catch (error) {
      this.logger.error("Failed to parse OpenAI JSON output", error);
      throw new BadRequestException("AI generated an invalid itinerary format.");
    }
  }

  /**
   * Generates a conversational response to a CRM query.
   */
  async smartQuery(tenantId: string, prompt: string) {
    // Gather brief CRM context for the AI
    const [leadsCount, bookingsCount] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, status: 'new' } }),
      this.prisma.booking.count({ where: { tenantId, status: 'confirmed' } })
    ]);

    const systemPrompt = `You are a helpful AI assistant built directly into Fellow CRM.
    The current state of this agency is:
    - ${leadsCount} New Leads awaiting follow-up
    - ${bookingsCount} Confirmed Bookings
    
    Answer the user's question concisely. If they ask for data you don't have, politely explain your limitations.`;

    const response = await this.generateCompletion(
      tenantId, 
      'crm_assistant', 
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    );

    return { reply: response.content };
  }
}
