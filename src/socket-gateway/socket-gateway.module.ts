import { Module } from '@nestjs/common';
import { SocketGatewayGateway } from './socket-gateway.gateway';
import { SocketGatewayService } from './socket-gateway.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DevicesModule } from 'src/devices/devices.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { HistoryModule } from 'src/history/history.module';
@Module({
  imports: [PrismaModule, DevicesModule, ScheduleModule, HistoryModule],
  providers: [SocketGatewayGateway, SocketGatewayService],
})
export class SocketGatewayModule {}
