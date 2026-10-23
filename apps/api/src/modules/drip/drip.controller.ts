import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { DripService } from './drip.service';
import { CreateDripSequenceDto } from './dto/create-drip-sequence.dto';
import { CreateDripStepDto } from './dto/create-drip-step.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('drip')
@UseGuards(JwtAuthGuard)
export class DripController {
  constructor(private readonly dripService: DripService) {}

  // ─── Sequences ─────────────────────────────────────────────────────────────

  @Post('sequences')
  createSequence(@TenantId() tenantId: string, @Body() dto: CreateDripSequenceDto) {
    return this.dripService.createSequence(tenantId, dto);
  }

  @Get('sequences')
  listSequences(@TenantId() tenantId: string) {
    return this.dripService.listSequences(tenantId);
  }

  @Get('sequences/:id')
  getSequence(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dripService.getSequence(tenantId, id);
  }

  @Patch('sequences/:id/toggle')
  toggleSequence(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.dripService.toggleSequence(tenantId, id, isActive);
  }

  @Delete('sequences/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSequence(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.dripService.deleteSequence(tenantId, id);
  }

  // ─── Steps ─────────────────────────────────────────────────────────────────

  @Post('sequences/:sequenceId/steps')
  addStep(
    @TenantId() tenantId: string,
    @Param('sequenceId') sequenceId: string,
    @Body() dto: CreateDripStepDto,
  ) {
    return this.dripService.addStep(tenantId, sequenceId, dto);
  }

  @Patch('steps/:stepId')
  updateStep(
    @TenantId() tenantId: string,
    @Param('stepId') stepId: string,
    @Body() dto: Partial<CreateDripStepDto>,
  ) {
    return this.dripService.updateStep(tenantId, stepId, dto);
  }

  @Delete('steps/:stepId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStep(@TenantId() tenantId: string, @Param('stepId') stepId: string) {
    return this.dripService.deleteStep(tenantId, stepId);
  }

  // ─── Jobs ──────────────────────────────────────────────────────────────────

  @Get('leads/:leadId/jobs')
  getJobsForLead(@TenantId() tenantId: string, @Param('leadId') leadId: string) {
    return this.dripService.getJobsForLead(tenantId, leadId);
  }

  @Post('leads/:leadId/cancel')
  @HttpCode(HttpStatus.OK)
  cancelLeadJobs(@TenantId() tenantId: string, @Param('leadId') leadId: string) {
    return this.dripService.cancelJobsForLead(tenantId, leadId);
  }
}
