import { Injectable } from '@nestjs/common';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async createTiktokInteractionHistory(createHistoryDto: CreateHistoryDto) {
    return this.prisma.tiktok_interaction_history.create({
      data: { ...createHistoryDto, finished_at: new Date() },
    });
  }

  tiktokCommentsCount(user_id: number) {
    return this.prisma.tiktok_interaction_history.count({
      where: {
        commented: {
          not: '',
        },
        device: {
          user_id,
        },
      },
    });
  }

  tiktokLikesCount(user_id: number) {
    return this.prisma.tiktok_interaction_history.count({
      where: {
        liked: true,
        device: {
          user_id,
        },
      },
    });
  }

  tiktokViewsCount(user_id: number) {
    return this.prisma.tiktok_interaction_history.aggregate({
      _sum: {
        total_views: true,
      },
      where: {
        device: {
          user_id,
        },
      },
    });
  }

  tiktokInteractionsCount(user_id: number) {
    return this.prisma.tiktok_interaction_history.count({
      where: {
        device: {
          user_id,
        },
      },
    });
  }

  async findAll(user_id: number) {
    return await this.prisma.tiktok_interaction_history.findMany({
      where: {
        device: {
          user_id,
        },
      },
      include: {
        device: {
          select: {
            google_accounts: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} history`;
  }

  update(id: number, updateHistoryDto: UpdateHistoryDto) {
    return `This action updates a #${id} history`;
  }

  remove(id: number) {
    return `This action removes a #${id} history`;
  }
}
