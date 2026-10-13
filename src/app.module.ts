import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { appConfig } from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { RideModule } from './ride/ride.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DriverModule,
    VehicleModule,
    RideModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT guard globally — use @Public() to opt out
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Apply Roles guard globally — use @Roles() to require specific roles
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
