import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AcceptRideDto {
  @ApiProperty({ description: 'ID of the vehicle the driver will use', example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;
}
