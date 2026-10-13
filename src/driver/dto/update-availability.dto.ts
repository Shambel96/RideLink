import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverAvailabilityStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateAvailabilityDto {
  @ApiProperty({ enum: DriverAvailabilityStatus, example: DriverAvailabilityStatus.AVAILABLE })
  @IsEnum(DriverAvailabilityStatus)
  status: DriverAvailabilityStatus;

  @ApiPropertyOptional({ example: 9.0054, description: 'Current latitude (required when going AVAILABLE)' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 38.7636, description: 'Current longitude (required when going AVAILABLE)' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
