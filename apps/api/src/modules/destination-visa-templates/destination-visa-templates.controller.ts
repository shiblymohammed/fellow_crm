import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DestinationVisaTemplatesService } from './destination-visa-templates.service';
import { CreateDestinationVisaTemplateDto } from './dto/create-template.dto';
import { UpdateDestinationVisaTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('destination-visa-templates')
@UseGuards(JwtAuthGuard)
export class DestinationVisaTemplatesController {
  constructor(private readonly templatesService: DestinationVisaTemplatesService) {}

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateDestinationVisaTemplateDto) {
    return this.templatesService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('includeGlobal') includeGlobal?: string,
  ) {
    return this.templatesService.findAll(tenantId, includeGlobal !== 'false');
  }

  @Get('destination/:destination')
  findByDestination(
    @TenantId() tenantId: string,
    @Param('destination') destination: string,
  ) {
    return this.templatesService.findByDestination(tenantId, destination);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDestinationVisaTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templatesService.remove(tenantId, id);
  }

  @Post(':id/clone')
  cloneGlobalTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templatesService.cloneGlobalTemplate(tenantId, id);
  }
}
