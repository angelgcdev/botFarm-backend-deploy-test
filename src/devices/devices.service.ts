import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { device } from './dto/device.dto';

import { DeviceStatus } from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  //Metodo para marcar como completado el campo de la tabla dispositivos
  async marcarComoCompleto(deviceId: number, userId: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    //Para validar que el dispositivo  pertenezca al usuario
    if (device.user_id !== userId) {
      throw new ForbiddenException('No puedes modificar este dispositivo');
    }

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        complete_config: true,
      },
    });
  }

  //Método para guardar el dispositivo
  async saveDevice(deviceData: device) {
    try {
      //Verifica si ya existe el dispositivo por su udid y el usuario_id
      const existingDevice = await this.prisma.device.findFirst({
        where: {
          udid: deviceData.udid,
          user_id: deviceData.user_id,
        },
      });

      if (existingDevice) {
        return {
          device: existingDevice,
          status: 'exists',
        };
      }

      //Si no existe guardas el dispositivo en la base de datos
      const newDevice = await this.prisma.device.create({
        data: deviceData,
      });

      return {
        device: newDevice,
        status: 'created',
      };
    } catch (error) {
      console.error('Error guardando el dispositivo: ', error);

      throw new Error('Error al guardar el dispositivo');
    }
  }

  //Metodo para actualizar el estado del dispositivo
  async updateStatusAndConnectionDevice(
    udid: string,
    user_id: number,
    newStatus: DeviceStatus,
    connected_at?: Date,
    last_activity?: Date,
  ) {
    const device = await this.prisma.device.findFirst({
      where: { udid, user_id },
    });

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return this.prisma.device.update({
      where: { id: device.id },
      data: {
        status: newStatus,
        ...(connected_at && { connected_at }),
        ...(last_activity && { last_activity }),
      },
    });
  }

  //Método para actualizar el estado de todos los dispositivos
  setAllDevicesToStatus(user_id: number, status: DeviceStatus) {
    return this.prisma.device.updateMany({
      where: { user_id },
      data: { status },
    });
  }

  async create(dto: CreateDeviceDto) {
    try {
      const { email, dispositivo_id, items } = dto;

      // 1. Insertar cuenta_google
      const googleAccount = await this.prisma.google_account.create({
        data: {
          device_id: dispositivo_id,
          email,
          status: 'ACTIVO',
        },
      });

      //2. Buscar IDs de las reds sociales por nombre
      const socialNetwork = await this.prisma.social_network.findMany({
        where: {
          name: {
            in: items,
          },
        },
      });

      //3. Crear entradas en cuenta_red_social
      const cuentaRedes = await this.prisma.$transaction(
        socialNetwork.map((red) =>
          this.prisma.social_network_account.create({
            data: {
              social_network_id: red.id,
              google_account_id: googleAccount.id,
              username: null,
              status: 'ACTIVO',
            },
          }),
        ),
      );

      return {
        status: true,
        message: 'Dispositivo y redes sociales asociados correctamente.',
        cuentaGoogle: googleAccount,
        cuentaRedes,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message:
          'Hubo un problema al asociar las redes sociales. intenta de nuevo.',
      };
    }
  }

  findAll(user_id: number) {
    return this.prisma.device.findMany({
      where: {
        user_id,
      },
    });
  }

  //Modificar los datos del formulario del informacion adicional del dispositivo
  async findOne(device_id: number) {
    const googleAccount = await this.prisma.google_account.findFirst({
      where: { device_id },
      include: {
        social_network_accounts: {
          include: {
            social_network: true,
          },
        },
      },
    });

    if (!googleAccount) {
      return { cuentaGoogle: null };
    }

    return {
      cuentaGoogle: googleAccount,
      cuenta_red_social: googleAccount.social_network_accounts,
    };
  }

  //Actualizar informacion del dispositivo
  async update(device_id: number, updateDeviceDto: UpdateDeviceDto) {
    const cuentaGoogleExistente = await this.prisma.google_account.findFirst({
      where: { device_id },
    });

    if (!cuentaGoogleExistente) {
      throw new NotFoundException('Cuenta de Google no encontrada.');
    }

    //1. Actualizar email
    await this.prisma.google_account.update({
      where: { id: cuentaGoogleExistente.id },
      data: { email: updateDeviceDto.email },
    });

    //2. Eliminar redes anteriores y crear nuevas
    await this.prisma.social_network_account.deleteMany({
      where: { google_account_id: cuentaGoogleExistente.id },
    });

    const redes = await this.prisma.social_network.findMany({
      where: { name: { in: updateDeviceDto.items } },
    });

    //3. actualizar tabla cuenta_red_social
    await this.prisma.$transaction(
      redes.map((r) =>
        this.prisma.social_network_account.create({
          data: {
            google_account_id: cuentaGoogleExistente.id,
            social_network_id: r.id,
            username: null,
            status: 'ACTIVO',
          },
        }),
      ),
    );

    return {
      status: true,
      message: 'Información actualizada correctamente.',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
