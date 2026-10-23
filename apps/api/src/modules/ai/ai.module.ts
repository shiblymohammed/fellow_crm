import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';

@Global()
@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [AiService],
  exports: [AiService],
  controllers: [AiController],
})
export class AiModule {}
