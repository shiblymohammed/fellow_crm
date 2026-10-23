import { Module, forwardRef } from '@nestjs/common';
import { TravellersService } from './travellers.service';
import { TravellersController } from './travellers.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { VisaApplicationsModule } from '../visa-applications/visa-applications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => VisaApplicationsModule)],
  controllers: [TravellersController],
  providers: [TravellersService],
  exports: [TravellersService],
})
export class TravellersModule {}
