// 1. Librerías de Node.js

// 2. Librerías de terceros
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

// 3. Librerías internas absolutas

// 4. Imports relativos
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/types/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Req() req: Request, @Body() createScheduleDto: CreateScheduleDto) {
    const user = req.user as JwtPayload;
    return this.scheduleService.create(createScheduleDto, user.userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.scheduleService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }
}
