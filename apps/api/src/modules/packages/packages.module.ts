import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PackagesController],
  providers: [PackagesService, PrismaService],
  exports: [PackagesService],
})
export class PackagesModule {}
