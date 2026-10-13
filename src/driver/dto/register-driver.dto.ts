import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDriverDto {
  @ApiProperty({ example: 'DL-AA-12345678', description: 'Official driver license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;
}
