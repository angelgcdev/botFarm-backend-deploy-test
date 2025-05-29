import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/types/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('comments/count')
  async tiktokCommentsCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (!payload) {
      throw new UnauthorizedException();
    }

    try {
      const countLikes = await this.historyService.tiktokCommentsCount(
        payload.sub,
      );

      return {
        success: true,
        message: `Existen ${countLikes} comentarios generados de tiktok.`,
        data: { count: countLikes },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al obtener la cantidad de comentarios generados en tiktok:',
          error,
        );

        return {
          success: false,
          message: 'Error al obtener los datos',
          error: error.message,
        };
      }

      //Si no es una instancia de Error, devuelve algo generico
      return {
        success: false,
        message: 'Error al obtener los datos',
        error: String(error),
      };
    }
  }

  @Get('likes/count')
  async tiktokLikesCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (!payload) {
      throw new UnauthorizedException();
    }

    try {
      const countLikes = await this.historyService.tiktokLikesCount(
        payload.sub,
      );

      return {
        success: true,
        message: `Existen ${countLikes} likes generados de tiktok.`,
        data: { count: countLikes },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al obtener la cantidad de likes generados en tiktok:',
          error,
        );

        return {
          success: false,
          message: 'Error al obtener los datos',
          error: error.message,
        };
      }

      //Si no es una instancia de Error, devuelve algo generico
      return {
        success: false,
        message: 'Error al obtener los datos',
        error: String(error),
      };
    }
  }

  @Get('views/count')
  async tiktokViewsCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (!payload) {
      throw new UnauthorizedException();
    }

    try {
      const countViews = await this.historyService.tiktokViewsCount(
        payload.sub,
      );

      return {
        success: true,
        message: `Existen ${countViews._sum.total_views} vistas generadas de tiktok.`,
        data: { count: countViews._sum.total_views },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al obtener la cantidad de vistas generadas en tiktok:',
          error,
        );

        return {
          success: false,
          message: 'Error al obtener los datos',
          error: error.message,
        };
      }

      //Si no es una instancia de Error, devuelve algo generico
      return {
        success: false,
        message: 'Error al obtener los datos',
        error: String(error),
      };
    }
  }

  @Get('interactions/count')
  async tiktokInteractionsCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (!payload) {
      throw new UnauthorizedException();
    }

    try {
      const count = await this.historyService.tiktokInteractionsCount(
        payload.sub,
      );

      return {
        success: true,
        message: `Existen ${count} interacciones de tiktok realizadas`,
        data: {
          count,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          'Error al obtener la cantidad del historial de interacciones de tiktok:',
          error,
        );

        return {
          success: false,
          message: 'Error al obtener los datos',
          error: error.message,
        };
      }

      //Si no es una instancia de Error, devuelve algo generico
      return {
        success: false,
        message: 'Error al obtener los datos',
        error: String(error),
      };
    }
  }

  @Get()
  findAll(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (!payload) {
      throw new UnauthorizedException();
    }
    return this.historyService.findAll(payload.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(+id, updateHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyService.remove(+id);
  }
}
