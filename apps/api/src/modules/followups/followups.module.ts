import { Module } from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { FollowupsController } from './followups.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [FollowupsController],
  providers: [FollowupsService, PrismaService],
  exports: [FollowupsService],
})
export class FollowupsModule {}
