import { ApiProperty } from '@nestjs/swagger';
import { RideStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

const DRIVER_ALLOWED = [
  RideStatus.DRIVER_ARRIVED,
  RideStatus.IN_PROGRESS,
  RideStatus.COMPLETED,
] as const;

export class UpdateRideStatusDto {
  @ApiProperty({
    enum: DRIVER_ALLOWED,
    description: 'Next status: DRIVER_ARRIVED → IN_PROGRESS → COMPLETED',
  })
  @IsEnum(DRIVER_ALLOWED, {
    message: 'Status must be one of: DRIVER_ARRIVED, IN_PROGRESS, COMPLETED',
  })
  status: typeof DRIVER_ALLOWED[number];
}
