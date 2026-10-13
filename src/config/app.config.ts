import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'ridelink-access-secret-change-in-prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'ridelink-refresh-secret-change-in-prod',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  fareCurrency: process.env.FARE_CURRENCY || 'ETB',
  fareBaseRate: parseFloat(process.env.FARE_BASE_RATE || '15'),
  farePerKm: parseFloat(process.env.FARE_PER_KM || '8'),
}));
