// 1. Librerías de Node.js

// 2. Librerías de terceros
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// 3. Librerías internas absolutas
import { InteractionStatus } from '@prisma/client';

// 4. Imports relativos
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  //Crear interaccion de tiktok
  async create(interactionData: CreateScheduleDto, user_id: number) {
    const { video_url, views_count, comment, liked, saved } = interactionData;

    return await this.prisma.scheduled_tiktok_interaction.create({
      data: {
        user_id,
        video_url,
        views_count: views_count ?? 0,
        comment,
        liked,
        saved,
      },
    });
  }

  findAll(user_id: number) {
    return this.prisma.scheduled_tiktok_interaction.findMany({
      where: {
        user_id,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} schedule`;
  }

  async updateStatusScheduleTiktokInteraction(data: {
    status: InteractionStatus;
    id: number;
  }) {
    const { status, id } = data;

    return await this.prisma.scheduled_tiktok_interaction.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    const existing = await this.prisma.scheduled_tiktok_interaction.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Registro con id ${id} no encontrado.`);
    }

    return await this.prisma.scheduled_tiktok_interaction.update({
      where: { id },
      data: updateScheduleDto,
    });
  }

  //eliminar datos
  async remove(id: number) {
    const interaction =
      await this.prisma.scheduled_tiktok_interaction.findUnique({
        where: { id },
      });

    if (!interaction) {
      throw new NotFoundException(`No se encontró la interacción con ID ${id}`);
    }

    return this.prisma.scheduled_tiktok_interaction.delete({ where: { id } });
  }
}
