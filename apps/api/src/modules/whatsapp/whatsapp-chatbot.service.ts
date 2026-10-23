import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappSenderService } from './whatsapp-sender.service';
import { UserRole } from '@prisma/client';
import { AiService } from '../ai/ai.service';

/**
 * 4-step chatbot state machine or AI-powered Chat:
 * state = 'chatbot' -> Step-by-step
 * state = 'ai' -> Routes to AiService for context-aware GPT responses
 */
@Injectable()
export class WhatsappChatbotService {
  private readonly logger = new Logger(WhatsappChatbotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: WhatsappSenderService,
    private readonly ai: AiService,
  ) {}

  async handleMessage(tenantId: string, waPhone: string, messageText: string, waMessageId?: string) {
    if (waMessageId) {
      const existing = await this.prisma.waMessage.findFirst({ where: { waMessageId } });
      if (existing) return;
    }

    let conversation = await this.prisma.waConversation.findFirst({
      where: { tenantId, waPhone, isActive: true },
    });

    const isNew = !conversation;
    
    // Check if Tenant has AI enabled
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const useAi = tenant?.aiEnabled || false;

    if (isNew) {
      conversation = await this.prisma.waConversation.create({
        data: {
          tenantId,
          waPhone,
          chatStep: 0,
          chatData: {},
          state: useAi ? 'ai' : 'chatbot',
          isActive: true,
        },
      });
    }

    if (conversation.state === 'human') return; // Ignore human-handled conversations

    await this.prisma.waMessage.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        direction: 'inbound',
        content: messageText,
        messageType: 'text',
        waMessageId,
        status: 'delivered',
      },
    });

    await this.prisma.waConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    if (conversation.state === 'ai') {
      await this.processAiChat(tenantId, conversation, messageText, isNew);
    } else {
      if (isNew) {
        await this.sender.sendText(
          tenantId,
          conversation.waPhone,
          `👋 Welcome to our travel service! Thank you for reaching out.\n\nWe've noted your interest in *${messageText.trim()}*!\n\n📅 When would you like to travel? Please share your travel dates\n(e.g., "15 Jan to 22 Jan")`,
          conversation.id,
        );
        await this.prisma.waConversation.update({
          where: { id: conversation.id },
          data: { chatStep: 2, chatData: { destination: messageText.trim() } },
        });
      } else {
        await this.processStep(tenantId, conversation, messageText);
      }
    }
  }

  private async processAiChat(tenantId: string, conversation: any, input: string, isNew: boolean) {
    // Detect human takeover request
    if (input.toLowerCase().includes('human') || input.toLowerCase().includes('talk to someone') || input.toLowerCase().includes('agent')) {
      await this.prisma.waConversation.update({
        where: { id: conversation.id },
        data: { state: 'human' }
      });
      await this.sender.sendText(tenantId, conversation.waPhone, 'I am transferring you to a human agent. They will reach out to you shortly!', conversation.id);
      return;
    }

    // Fetch conversation history
    const history = await this.prisma.waMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { sentAt: 'asc' },
      take: 10
    });

    const messages = [
      { 
        role: 'system', 
        content: `You are a helpful travel agency assistant. Help the customer plan their trip. Ask for their destination, travel dates, traveller count, and budget. If they ask for a human, they will be transferred. Keep responses short and conversational.` 
      },
      ...history.map(msg => ({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    try {
      const response = await this.ai.generateCompletion(tenantId, 'whatsapp_chat', messages);
      const reply = response.content;

      await this.sender.sendText(tenantId, conversation.waPhone, reply, conversation.id);

      await this.prisma.waMessage.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          direction: 'outbound',
          content: reply,
          messageType: 'text',
          status: 'sent',
        },
      });
    } catch (error) {
      this.logger.error('Failed to generate AI response: ' + error.message);
      // Fallback to human
      await this.prisma.waConversation.update({ where: { id: conversation.id }, data: { state: 'human' } });
      await this.sender.sendText(tenantId, conversation.waPhone, 'Sorry, I am having trouble right now. A human agent will take over soon.', conversation.id);
    }
  }

  private async processStep(tenantId: string, conversation: any, input: string) {
    const step = conversation.chatStep;
    const data = (conversation.chatData as any) || {};

    switch (step) {
      case 1:
        // Ask for destination (fallback if somehow at step 1)
        data.destination = input.trim();
        await this.sender.sendText(
          tenantId,
          conversation.waPhone,
          `✈️ Great choice — *${data.destination}*!\n\n📅 When would you like to travel?\n(e.g., "15 Jan to 22 Jan")`,
          conversation.id,
        );
        await this.prisma.waConversation.update({
          where: { id: conversation.id },
          data: { chatStep: 2, chatData: data },
        });
        break;

      case 2:
        // Got dates, ask for traveller count
        data.travelDates = input.trim();
        await this.sender.sendText(
          tenantId,
          conversation.waPhone,
          `📅 Perfect!\n\n👥 How many people will be travelling?\n(e.g., "2 adults", "2 adults 1 child")`,
          conversation.id,
        );
        await this.prisma.waConversation.update({
          where: { id: conversation.id },
          data: { chatStep: 3, chatData: data },
        });
        break;

      case 3:
        // Got count, ask for budget
        data.travellerCount = input.trim();
        await this.sender.sendText(
          tenantId,
          conversation.waPhone,
          `👥 Got it!\n\n💰 What is your approximate *budget per person* (in ₹)?\n(e.g., "25000" or "₹30,000")`,
          conversation.id,
        );
        await this.prisma.waConversation.update({
          where: { id: conversation.id },
          data: { chatStep: 4, chatData: data },
        });
        break;

      case 4:
        // Got budget — complete the lead
        data.budget = input.trim();
        await this.completeLead(tenantId, conversation, data);
        break;

      default:
        // Unknown/stale step — restart gracefully
        await this.sender.sendText(
          tenantId,
          conversation.waPhone,
          `Hi! Where would you like to travel? 🌏`,
          conversation.id,
        );
        await this.prisma.waConversation.update({
          where: { id: conversation.id },
          data: { chatStep: 1, chatData: {} },
        });
    }
  }

  private async completeLead(tenantId: string, conversation: any, data: any) {
    try {
      // Fix #2 — Use UserRole.sales enum instead of raw string 'sales'
      const salesUser = await this.prisma.user.findFirst({
        where: { tenantId, role: UserRole.sales, isActive: true },
      });

      const phone = conversation.waPhone;

      // Upsert customer by phone (unique per tenant)
      let customer = await this.prisma.customer.findFirst({
        where: { tenantId, phone },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            tenantId,
            name: `WA Lead (${phone})`,
            phone,
            whatsapp: phone,
            source: 'whatsapp',
          },
        });
      }

      // Create lead
      const lead = await this.prisma.lead.create({
        data: {
          tenantId,
          customerId: customer.id,
          destination: data.destination,
          specialRequests: `Dates: ${data.travelDates} | Travellers: ${data.travellerCount} | Budget: ${data.budget}`,
          source: 'whatsapp',
          status: 'new',
          assignedTo: salesUser?.id,
        },
      });

      // Link conversation to lead and hand off to human
      await this.prisma.waConversation.update({
        where: { id: conversation.id },
        data: {
          leadId: lead.id,
          state: 'human',
          isActive: false,
        },
      });

      // Send confirmation
      await this.sender.sendText(
        tenantId,
        conversation.waPhone,
        `🎉 Thank you! We've received your enquiry for *${data.destination}*.\n\nOur travel expert will contact you shortly to plan your perfect trip! 🌏\n\nHave a great day! 😊`,
        conversation.id,
      );

      this.logger.log(`✅ WA lead created: ${lead.id} assigned to ${salesUser?.id || 'unassigned'}`);
    } catch (error) {
      this.logger.error(`Failed to complete WA lead: ${error.message}`);
      await this.sender.sendText(
        tenantId,
        conversation.waPhone,
        `Thank you! Our team will reach out to you soon on this number. 🙏`,
        conversation.id,
      );
    }
  }
}
