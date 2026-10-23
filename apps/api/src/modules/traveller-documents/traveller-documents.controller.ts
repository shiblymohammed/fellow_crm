import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TravellerDocumentsService } from './traveller-documents.service';
import { StorageService } from '../storage/storage.service';
import { CreateTravellerDocumentDto } from './dto/create-traveller-document.dto';
import { UpdateTravellerDocumentDto } from './dto/update-traveller-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('traveller-documents')
export class TravellerDocumentsController {
  constructor(
    private readonly travellerDocumentsService: TravellerDocumentsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  create(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() createDto: CreateTravellerDocumentDto,
  ) {
    return this.travellerDocumentsService.create(tenantId, createDto, req.user?.sub);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() uploadDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload file to storage
    const fileName = `documents/${tenantId}/${uploadDto.bookingId}/${uploadDto.travellerId}/${Date.now()}-${file.originalname}`;
    const fileUrl = await this.storageService.uploadFile(
      fileName,
      file.buffer,
      file.mimetype,
    );

    // Create or update document record
    const existingDoc = await this.travellerDocumentsService.findAll(
      tenantId,
      uploadDto.bookingId,
      uploadDto.travellerId,
    );

    const docExists = existingDoc.find(d => d.docType === uploadDto.docType);

    if (docExists) {
      // Update existing document
      return this.travellerDocumentsService.update(
        tenantId,
        docExists.id,
        {
          fileUrl,
          fileName: file.originalname,
        },
        req.user?.sub,
      );
    } else {
      // Create new document
      return this.travellerDocumentsService.create(
        tenantId,
        {
          ...uploadDto,
          fileUrl,
          fileName: file.originalname,
        },
        req.user?.sub,
      );
    }
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId?: string,
    @Query('travellerId') travellerId?: string,
  ) {
    return this.travellerDocumentsService.findAll(tenantId, bookingId, travellerId);
  }

  @Get('stats/:bookingId')
  getStats(@TenantId() tenantId: string, @Param('bookingId') bookingId: string) {
    return this.travellerDocumentsService.getDocumentStatsSummary(tenantId, bookingId);
  }

  @Get(':id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.travellerDocumentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateTravellerDocumentDto,
  ) {
    return this.travellerDocumentsService.update(tenantId, id, updateDto, req.user?.sub);
  }

  @Patch(':id/verify')
  verify(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.travellerDocumentsService.verifyDocument(tenantId, id, req.user?.sub);
  }

  @Patch(':id/reject')
  reject(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Param('id') id: string,
    @Body('rejectionNote') rejectionNote: string,
  ) {
    if (!rejectionNote) {
      throw new BadRequestException('Rejection note is required');
    }
    return this.travellerDocumentsService.rejectDocument(tenantId, id, rejectionNote, req.user?.sub);
  }

  @Patch(':id/mark-missing')
  markMissing(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.travellerDocumentsService.markAsMissing(tenantId, id);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.travellerDocumentsService.remove(tenantId, id);
  }

  @Post('create-placeholders/:bookingId')
  createPlaceholders(
    @TenantId() tenantId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.travellerDocumentsService.createDocumentPlaceholders(tenantId, bookingId);
  }
}
