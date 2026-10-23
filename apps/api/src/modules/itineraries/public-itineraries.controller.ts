import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public Itineraries')
@Public()
@Controller('public/itineraries')
export class PublicItinerariesController {
  constructor(private prisma: PrismaService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get a public itinerary by its slug' })
  async getPublicItinerary(@Param('slug') slug: string) {
    const itinerary = await this.prisma.itinerary.findFirst({
      where: { publicSlug: slug },
      include: {
        days: {
          orderBy: { sortOrder: 'asc' }
        },
        booking: {
          select: {
            destination: true,
            travelDate: true,
            returnDate: true,
            tenant: {
              select: {
                name: true,
                logoUrl: true,
                primaryColor: true
              }
            },
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // Restructure to match expected frontend format
    const response = {
      ...itinerary,
      tenant: itinerary.booking.tenant
    };

    return response;
  }
}
