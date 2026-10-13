import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class RequestRideDto {
  @ApiProperty({ example: 9.0054, description: 'Pickup latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLatitude: number;

  @ApiProperty({ example: 38.7636, description: 'Pickup longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLongitude: number;

  @ApiProperty({ example: 9.0272, description: 'Destination latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLatitude: number;

  @ApiProperty({ example: 38.7468, description: 'Destination longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLongitude: number;
}
