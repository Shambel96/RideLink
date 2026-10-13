import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DriverVerificationStatus, UserRole } from '@prisma/client';
import { DriverService } from './driver.service';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { VerifyDriverDto } from './dto/verify-driver.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Drivers')
@ApiBearerAuth('access-token')
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('register')
  @ApiOperation({ summary: 'Apply to become a driver' })
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDriverDto) {
    return this.driverService.register(user.sub, dto);
  }

  @Get('me')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get my driver profile' })
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.driverService.getMyProfile(user.sub);
  }

  @Patch('me/availability')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Update my availability status and location' })
  updateAvailability(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAvailabilityDto) {
    return this.driverService.updateAvailability(user.sub, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] List all drivers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DriverVerificationStatus })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: DriverVerificationStatus,
  ) {
    return this.driverService.findAll({ page, limit, status });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get a driver by ID' })
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }

  @Patch(':id/verify')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Approve, reject, or suspend a driver' })
  verify(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() dto: VerifyDriverDto,
  ) {
    return this.driverService.verify(id, admin.sub, dto);
  }
}
