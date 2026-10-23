import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertItineraryTemplateDto } from './dto/upsert-itinerary-template.dto';

@Injectable()
export class ItineraryTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplate(tenantId: string, packageId: string) {
    const template = await this.prisma.packageItineraryTemplate.findUnique({
      where: {
        tenantId_packageId: { tenantId, packageId },
      },
      include: {
        templateDays: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    return template; // Returns null if not exists, which is fine (204 No Content typically or just empty object)
  }

  async upsertTemplate(tenantId: string, packageId: string, userId: string, dto: UpsertItineraryTemplateDto) {
    // Check if package exists
    const pkg = await this.prisma.package.findFirst({ where: { id: packageId, tenantId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert the main template record
      const template = await tx.packageItineraryTemplate.upsert({
        where: {
          tenantId_packageId: { tenantId, packageId },
        },
        update: {
          title: dto.title,
        },
        create: {
          tenantId,
          packageId,
          title: dto.title,
          createdBy: userId,
        },
      });

      // Get existing days
      const existingDays = await tx.packageItineraryTemplateDay.findMany({
        where: { templateId: template.id },
      });
      const existingDayIds = existingDays.map((d) => d.id);
      
      const incomingDayIds = dto.days.map((d) => d.id).filter(Boolean) as string[];
      
      // Delete days that are no longer in the payload
      const daysToDelete = existingDayIds.filter((id) => !incomingDayIds.includes(id));
      if (daysToDelete.length > 0) {
        await tx.packageItineraryTemplateDay.deleteMany({
          where: { id: { in: daysToDelete } },
        });
      }

      // Upsert each incoming day
      for (const day of dto.days) {
        if (day.id && existingDayIds.includes(day.id)) {
          await tx.packageItineraryTemplateDay.update({
            where: { id: day.id },
            data: {
              dayNumber: day.dayNumber,
              title: day.title,
              description: day.description,
              activities: day.activities as any,
            },
          });
        } else {
          await tx.packageItineraryTemplateDay.create({
            data: {
              tenantId,
              templateId: template.id,
              dayNumber: day.dayNumber,
              title: day.title,
              description: day.description,
              activities: day.activities as any,
            },
          });
        }
      }

      return template;
    });

    return this.getTemplate(tenantId, packageId);
  }
}
