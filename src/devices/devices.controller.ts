import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
// import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/types/jwt-payload.interface';
import { DeviceStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  //Añadir informacion adicional en las tablas cuenta_google y cuenta_red_social
  @Post('complete-info')
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    return await this.devicesService.findAll(payload.userId);
  }

  //Obtener informacion de un dispositivo
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  //Actualizar el campo completar_info en la tabla dispositivos
  @Patch(':id/complete')
  completarInfo(@Param('id') id: string, @Req() req: Request) {
    const dispositivoId = Number(id);
    const payload = req.user as JwtPayload;

    return this.devicesService.marcarComoCompleto(
      dispositivoId,
      payload.userId,
    );
  }

  //Actualizar informacion del dispositivo
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateDeviceDto) {
    return this.devicesService.update(+id, dto);
  }

  //Actualizar el estado de los dispositivos al hacer logout
  @Patch('logout')
  async updateAllStatus(
    @Req() req: Request,
    @Body() body: { status: DeviceStatus },
  ) {
    const payload = req.user as JwtPayload;
    return await this.devicesService.setAllDevicesToStatus(
      payload.userId,
      body.status,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
