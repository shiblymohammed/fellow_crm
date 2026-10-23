import { Module } from '@nestjs/common';
import { PlatformLeadsService } from './platform-leads.service';
import { PlatformLeadsController } from './platform-leads.controller';

@Module({
  controllers: [PlatformLeadsController],
  providers: [PlatformLeadsService],
})
export class PlatformLeadsModule {}
