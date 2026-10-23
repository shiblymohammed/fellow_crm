import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlatformLeadsService } from './platform-leads.service';
import { CreatePlatformLeadDto } from './dto/create-platform-lead.dto';
import { UpdatePlatformLeadDto } from './dto/update-platform-lead.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('platform-leads')
@UseGuards(RolesGuard)
export class PlatformLeadsController {
  constructor(private readonly platformLeadsService: PlatformLeadsService) {}

  @Post()
  @Public()
  create(@Body() createPlatformLeadDto: CreatePlatformLeadDto) {
    return this.platformLeadsService.create(createPlatformLeadDto);
  }

  @Get()
  @Roles('super_admin')
  findAll() {
    return this.platformLeadsService.findAll();
  }

  @Get(':id')
  @Roles('super_admin')
  findOne(@Param('id') id: string) {
    return this.platformLeadsService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  update(@Param('id') id: string, @Body() updatePlatformLeadDto: UpdatePlatformLeadDto) {
    return this.platformLeadsService.update(id, updatePlatformLeadDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id') id: string) {
    return this.platformLeadsService.remove(id);
  }
}
