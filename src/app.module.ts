import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SocketGatewayModule } from './socket-gateway/socket-gateway.module';
import { DevicesModule } from './devices/devices.module';
import { HistoryModule } from './history/history.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AutomationModule } from './automation/automation.module';
import { ScheduleModule } from './schedule/schedule.module';

import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SocketGatewayModule,
    DevicesModule,
    HistoryModule,
    DashboardModule,
    AutomationModule,
    ScheduleModule,
    ConfigModule.forRoot({
      isGlobal: true, // Hacer que las variables de entorno estén disponibles globalmente
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
