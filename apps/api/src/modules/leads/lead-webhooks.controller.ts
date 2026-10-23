import { Controller, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhooks/leads')
export class LeadWebhooksController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post(':tenantId')
  async handleWebhook(
    @Param('tenantId') tenantId: string,
    @Body() createLeadDto: CreateLeadDto,
  ) {
    try {
      // Create lead without a specific creator userId (fallback to null)
      const lead = await this.leadsService.create(tenantId, null as any, createLeadDto);
      return { success: true, leadId: lead.id };
    } catch (error: any) {
      throw new HttpException({ success: false, error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
