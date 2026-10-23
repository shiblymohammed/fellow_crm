import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ItinerariesService } from './itineraries.service';
import { UpsertItineraryDto, CloneTemplateDto } from './dto/itinerary.dto';

@ApiTags('Itineraries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings/:bookingId/itinerary')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Get()
  @ApiOperation({ summary: 'Get itinerary for a booking' })
  async getItinerary(@TenantId() tenantId: string, @Param('bookingId') bookingId: string) {
    const itinerary = await this.itinerariesService.getItinerary(tenantId, bookingId);
    return itinerary || {};
  }

  @Post('clone')
  @ApiOperation({ summary: 'Clone a template to create an itinerary' })
  async cloneTemplate(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: CloneTemplateDto,
  ) {
    return this.itinerariesService.cloneTemplate(tenantId, bookingId, req.user.id, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update an itinerary' })
  async upsertItinerary(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpsertItineraryDto,
  ) {
    return this.itinerariesService.upsertItinerary(tenantId, bookingId, req.user.id, dto);
  }
  @Post('generate-ai')
  @ApiOperation({ summary: 'Generate itinerary using AI' })
  async generateAiItinerary(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      return await this.itinerariesService.generateAiItinerary(tenantId, bookingId, req.user.id);
    } catch (error) {
      console.error('AI GEN ERROR IN BACKEND:', error);
      throw error;
    }
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Generate PDF for itinerary' })
  async generatePdf(
    @TenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
  ) {
    const itinerary = await this.itinerariesService.getItinerary(tenantId, bookingId);
    if (!itinerary) throw new NotFoundException('Itinerary not found');
    return this.itinerariesService.generatePdf(tenantId, bookingId, itinerary.id);
  }

  @Post('pdf/send-whatsapp')
  @ApiOperation({ summary: 'Send PDF via WhatsApp to customer' })
  async sendPdfViaWhatsapp(
    @TenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
  ) {
    const itinerary = await this.itinerariesService.getItinerary(tenantId, bookingId);
    if (!itinerary) throw new NotFoundException('Itinerary not found');
    return this.itinerariesService.sendPdfViaWhatsapp(tenantId, bookingId, itinerary.id);
  }
}
