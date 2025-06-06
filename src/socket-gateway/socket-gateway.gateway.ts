/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// 1. Librerías de Node.js

// 2. Librerías de terceros
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  InteractionStatus,
  scheduled_tiktok_interaction,
} from '@prisma/client';

// 3. Librerías internas absolutas

// 4. Imports relativos
import { DevicesService } from 'src/devices/devices.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { device } from '../devices/dto/device.dto';
import { HistoryService } from 'src/history/history.service';
import { CreateHistoryDto } from '../history/dto/create-history.dto';
import { BadRequestException } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class SocketGatewayGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private devicesService: DevicesService,
    private scheduleService: ScheduleService,
    private historyService: HistoryService,
  ) {}

  //Evento para usuarios conectados
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  //Evento para usuarios desconectados
  handleDisconnect(client: Socket) {
    const usuario_id = client.data?.usuario_id;
    if (usuario_id) {
      const room = `usuario_${usuario_id}`;
      console.log(
        `Cliente ${client.id} (Usuario ${usuario_id}) desconectado de la sala ${room}`,
      );
      // // Opcional: Limpiar datos o notificar a otros clientes
      // this.server.to(room).emit('usuario_desconectado', { usuario_id });
    } else {
      console.log(`Cliente ${client.id} desconectado`);
    }
  }

  //Registrar usuario a la sala
  @SubscribeMessage('user:register')
  async handleUserRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { user_id: number },
  ) {
    if (!data?.user_id) {
      client.disconnect();
      console.warn(`Cliente ${client.id} intentó registrarse sin user_id`);
    }

    const room = `usuario_${data.user_id}`;
    await client.join(room);

    //Guardar el usuario_id en el socket del usuario
    client.data.user_id = data.user_id;

    console.log(`Socket ${client.id} unido a la sala ${room}`);
  }

  //Evento para cerrar sesion socket io client
  @SubscribeMessage('cerrarSesion')
  handleCloseSesionClient(@ConnectedSocket() client: Socket): void {
    const user_id = client.data.user_id; // Acceder al usuario_id
    const room = `usuario_${user_id}`; //Definir la sala del usuario

    try {
      //Remitimos al servidor local
      this.server.to(room).emit('cerrarSesion');
    } catch (error) {
      console.error(
        'Error al emitir el evento de cerrar sesión del cliente',
        error,
      );
    }
  }

  //Escuchar evento para recibir Datos para la automatizacion
  @SubscribeMessage('schedule:tiktok:start')
  async handleScheduleTiktokStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      scheduledTiktokInteractionData: scheduled_tiktok_interaction;
      activeDevices: device[];
    },
  ): Promise<void> {
    const user_id = client.data.user_id; // Acceder al usuario_id
    const room = `usuario_${user_id}`; //Definir la sala del usuario

    console.log(`Interacción de TikTok recibida del usuario ${user_id}:`);
    console.log('Datos del frontend:', data);
    console.log('📹Datos del formulario:', data.scheduledTiktokInteractionData);
    console.log('📱Dispositivos activos:', data.activeDevices);

    try {
      // Actualizar el estado en la base de datos
      const status = 'EN_PROGRESO';
      const res =
        await this.scheduleService.updateStatusScheduleTiktokInteraction({
          status,
          id: data.scheduledTiktokInteractionData.id,
        });

      console.log('Estado actualizado con exito:', res);

      // Emitir al frontend para que vuelva a cargar los datos cuando llega el evento
      this.server.to(room).emit('schedule:tiktok:interaction:update');

      //Remitimos al servidor local
      this.server.to(room).emit('schedule:tiktok:execute', data);
    } catch (error) {
      console.error('Error inesperado:', error.message);
    }
  }

  //Escuchar evento para recibir tiempo estimado de la interaccion
  @SubscribeMessage('schedule:tiktok:estimated_time_all')
  handleScheduleTiktokEstimatedTimeAll(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      estimatedTime: string;
      interactionId: number;
    },
  ): void {
    const user_id = client.data.user_id; // Acceder al usuario_id
    const room = `usuario_${user_id}`; //Definir la sala del usuario

    try {
      console.log('Tiempo estimado:', data.estimatedTime);

      // Emitir al frontend para que vuelva a cargar los datos cuando llega el evento
      this.server.to(room).emit('schedule:tiktok:interaction:update');

      //Remitimos al servidor local
      this.server.to(room).emit('schedule:tiktok:estimated_time_all', data);
    } catch (error) {
      console.error('Error inesperado:', error.message);
    }
  }

  // Evento para cancelar todas la ejecuciones
  @SubscribeMessage('cancel:tiktok:interaction')
  async handleScheduleTiktokCancelled(
    @ConnectedSocket() client: Socket,
    @MessageBody() scheduledTiktokInteraction_id: number,
  ): Promise<void> {
    const user_id = client.data.user_id; // Acceder al usuario_id
    const room = `usuario_${user_id}`; //Definir la sala del usuario

    try {
      // Actualizar el estado en la base de datos
      const status = 'CANCELADO';
      const res =
        await this.scheduleService.updateStatusScheduleTiktokInteraction({
          status,
          id: scheduledTiktokInteraction_id,
        });

      console.log(res);

      // Emitir al frontend para que vuelva a cargar los datos cuando llega el evento
      this.server.to(room).emit('schedule:tiktok:interaction:update');

      //Emitimos al servidor local
      this.server.to(room).emit('cancel:tiktok:interaction');
    } catch (error) {
      console.error(error.message);
    }
  }

  // Evento para notificaciones al frontend
  @SubscribeMessage('notification:localServer')
  handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      type: string;
      message: string;
      scheduledTiktokInteraction_id: number;
      status: InteractionStatus;
    },
  ): void {
    const user_id = client.data.user_id; // Acceder al usuario_id
    const room = `usuario_${user_id}`; //Definir la sala del usuario

    try {
      // Emitir al frontend para que vuelva a cargar los datos cuando llega el evento
      this.server.to(room).emit('schedule:tiktok:interaction:update');

      this.server.to(room).emit('interaction:canceled');

      //Remitimos al frontend
      this.server.to(room).emit('notification:frontend', data);
    } catch (error) {
      console.error('Error al enviar la notificación', error);
    }
  }

  //Escuchar el evento "schedule:tiktok:status:update" y actualizar el estado en la base de datos
  @SubscribeMessage('schedule:tiktok:status:update')
  async handleDeviceScheduleTiktokStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      activeDevice: any;
      status: InteractionStatus;
      history: any;
      scheduledTiktokInteraction_id: number;
      error?: any;
    },
  ): Promise<void> {
    const user_id = client.data.user_id; // Acceder al usuario_id
    const room = `usuario_${user_id}`; //Definir la sala del usuario

    const createHistoryData: CreateHistoryDto = {
      ...data.history,
      status: data.status,
    };
    console.log('Datos de la interaccion:', data);

    try {
      // Actualizar el estado en la base de datos
      const res =
        await this.scheduleService.updateStatusScheduleTiktokInteraction({
          status: data.status,
          id: data.scheduledTiktokInteraction_id,
        });

      console.log(res);

      // Añadir al historial de tiktok
      const resHistory =
        await this.historyService.createTiktokInteractionHistory(
          createHistoryData,
        );

      console.log(resHistory);

      //Notificacion al frontend
      this.server.to(room).emit('schedule:tiktok:status:notification', data);

      // Emitir al frontend para que vuelva a cargar los datos cuando llega el evento
      this.server.to(room).emit('schedule:tiktok:interaction:update');

      // // liberar el bloqueo de las interacciones
      // this.server.to(room).emit('interaction:completed', {
      //   interactionId: data.scheduledTiktokInteraction_id,
      // });
    } catch (error) {
      console.error('Error al actualizar el estado', error.message);
    }
  }

  //Escuchar evento dispositivo conectado y guardar
  @SubscribeMessage('device:connected')
  async handleDeviceConnected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: device,
  ): Promise<void> {
    const user_id = client.data.user_id;
    const room = `usuario_${user_id}`;

    console.log(`dispositivo conectado recibido de Usuario ${user_id}:`, data);

    try {
      //Guardar el dispositivo en la base de datos usando el servicio
      const res = await this.devicesService.saveDevice(data);
      console.log('Dispositivo nuevo:', res);

      //Remitimos al servidor local
      this.server.to(room).emit('device:connected:notification', data.udid);
      this.server.to(room).emit('device:connected:status', {
        udid: data.udid,
        status: 'ACTIVO',
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        // si ya existe Actualizar el estado del dispositivo
        console.log('Dispositivo existente:', error.message);

        const res = await this.devicesService.updateStatusAndConnectionDevice(
          data.udid,
          +user_id,
          'ACTIVO',
          new Date(), // connected_at
        );

        console.log(res);

        //Remitimos al servidor local
        this.server.to(room).emit('device:connected:notification', data.udid);
        this.server.to(room).emit('device:connected:status', {
          udid: data.udid,
          status: 'ACTIVO',
        });
      } else {
        console.error(error.message);
      }
    }
  }

  // Evento dispositivo desconectado y actualizar estado
  @SubscribeMessage('device:disconnected')
  async handleDeviceDisconnected(
    @ConnectedSocket() client: Socket,
    @MessageBody() udid: string,
  ): Promise<void> {
    const user_id = client.data.user_id;
    const room = `usuario_${user_id}`;

    console.log(
      `dispositivo desconectado recibido de Usuario ${user_id}:`,
      udid,
    );

    //Actualizar el estado del dispositivo en la base de datos usando el servicio
    try {
      const res = await this.devicesService.updateStatusAndConnectionDevice(
        udid,
        +user_id,
        'INACTIVO',
        undefined, // connected_at
        new Date(), // last_activity
      );

      console.log(res);

      //Remitimos al servidor local
      this.server.to(room).emit('device:disconnected:notification', udid);
      this.server.to(room).emit('device:disconnected:status', {
        udid,
        status: 'INACTIVO',
      });
    } catch (error) {
      console.error(error.message);
    }
  }
}
