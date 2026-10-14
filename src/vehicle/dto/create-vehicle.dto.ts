import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: '3-AA-12345' })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({ example: 'Toyota Corolla' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.SEDAN })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year?: number;
}
