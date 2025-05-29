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
  UnauthorizedException,
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
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    const res = await this.devicesService.create(createDeviceDto);
    console.log(res);
    return res;
  }

  @Get()
  findAll(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    if (!payload) {
      throw new UnauthorizedException();
    }
    return this.devicesService.findAll(payload.sub);
  }

  //Modificar los datos del formulario del informacion adicional del dispositivo
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  //Actualizar el campo completar_info en la tabla dispositivos
  @Patch(':id/complete')
  completarInfo(@Param('id') id: string, @Req() req: Request) {
    const dispositivoId = Number(id);

    const payload = req.user as JwtPayload;
    if (!payload) {
      throw new UnauthorizedException();
    }

    return this.devicesService.marcarComoCompleto(dispositivoId, payload.sub);
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
    if (!payload.sub) {
      throw new UnauthorizedException('No autenticado');
    }

    try {
      const result = await this.devicesService.setAllDevicesToStatus(
        payload.sub,
        body.status,
      );

      return {
        success: true,
        message: `Se actualizaron ${result.count} dispositivos al estado ${body.status}`,
        data: {
          updatedCount: result.count,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al actualizar dispositivos:', error);

        return {
          success: false,
          message: 'Error al actualizar los dispositivos',
          error: error.message,
        };
      }

      //Si no es una instancia de Error, devuelve algo generico
      return {
        success: false,
        message: 'Error desconocido al actualizar los dispositivos',
        error: String(error),
      };
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
