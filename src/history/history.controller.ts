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
    return await this.historyService.tiktokCommentsCount(payload.userId);
  }

  @Get('likes/count')
  async tiktokLikesCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    return await this.historyService.tiktokLikesCount(payload.userId);
  }

  @Get('views/count')
  async tiktokViewsCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    return await this.historyService.tiktokViewsCount(payload.userId);
  }

  @Get('interactions/count')
  async tiktokInteractionsCount(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    return await this.historyService.tiktokInteractionsCount(payload.userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (!payload) {
      throw new UnauthorizedException();
    }
    return this.historyService.findAll(payload.userId);
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
