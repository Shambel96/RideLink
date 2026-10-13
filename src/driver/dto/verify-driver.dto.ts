import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverVerificationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

const ALLOWED = [
  DriverVerificationStatus.APPROVED,
  DriverVerificationStatus.REJECTED,
  DriverVerificationStatus.SUSPENDED,
] as const;

export class VerifyDriverDto {
  @ApiProperty({ enum: ALLOWED })
  @IsEnum(ALLOWED)
  status: typeof ALLOWED[number];

  @ApiPropertyOptional({ example: 'License document is incomplete' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
