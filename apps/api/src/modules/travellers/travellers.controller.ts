import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TravellersService } from './travellers.service';
import { CreateTravellerDto } from './dto/create-traveller.dto';
import { UpdateTravellerDto } from './dto/update-traveller.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Travellers')
@ApiBearerAuth()
@Controller('travellers')
export class TravellersController {
  constructor(private readonly travellersService: TravellersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new traveller' })
  create(
    @TenantId() tenantId: string,
    @Body() createTravellerDto: CreateTravellerDto,
  ) {
    return this.travellersService.create(tenantId, createTravellerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all travellers (optionally filtered by bookingId)' })
  findAll(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId?: string,
  ) {
    if (bookingId) {
      return this.travellersService.findAllByBooking(tenantId, bookingId);
    }
    return this.travellersService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a traveller by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.travellersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a traveller' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateTravellerDto: UpdateTravellerDto,
  ) {
    return this.travellersService.update(tenantId, id, updateTravellerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a traveller' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.travellersService.remove(tenantId, id);
  }
}
