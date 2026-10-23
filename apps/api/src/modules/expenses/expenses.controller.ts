import { Controller, Get, Post, Body, UseGuards, Query, Request, Delete, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { StorageService } from '../storage/storage.service';
import * as path from 'path';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('receipt', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only JPEG, PNG, WebP, and PDF files are allowed') as any, false);
      }
    },
  }))
  async create(
    @TenantId() tenantId: string,
    @Request() req: any,
    @Body() createDto: CreateExpenseDto,
    @UploadedFile() receipt?: Express.Multer.File,
  ) {
    let receiptUrl: string | undefined;
    if (receipt) {
      const ext = path.extname(receipt.originalname);
      const fileName = `receipt-${Date.now()}${ext}`;
      receiptUrl = await this.storageService.uploadFile(fileName, receipt.buffer, receipt.mimetype);
    }

    return this.expensesService.create(tenantId, req.user.id, createDto, receiptUrl);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('bookingId') bookingId?: string,
  ) {
    if (bookingId) {
      return this.expensesService.findAllByBooking(tenantId, bookingId);
    }
    return [];
  }

  @Delete(':id')
  remove(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.remove(tenantId, id);
  }
}
