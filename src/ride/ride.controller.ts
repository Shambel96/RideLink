import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RideService } from './ride.service';
import { RequestRideDto } from './dto/request-ride.dto';
import { AcceptRideDto } from './dto/accept-ride.dto';
import { UpdateRideStatusDto } from './dto/update-ride-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Rides')
@ApiBearerAuth('access-token')
@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post()
  @Roles(UserRole.PASSENGER)
  @ApiOperation({ summary: 'Request a new ride (passengers only)' })
  requestRide(@CurrentUser() user: JwtPayload, @Body() dto: RequestRideDto) {
    return this.rideService.requestRide(user.sub, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my ride history (passenger or driver)' })
  @ApiQuery({ name: 'role', required: false, enum: ['passenger', 'driver'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyRides(
    @CurrentUser() user: JwtPayload,
    @Query('role') role: 'passenger' | 'driver' = 'passenger',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rideService.getMyRides(user.sub, role, page, limit);
  }

  @Get('available')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get available ride requests (available drivers only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAvailableRides(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rideService.getAvailableRides(user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride details by ID' })
  getRideById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.rideService.getRideById(id, user.sub);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PASSENGER)
  @ApiOperation({ summary: 'Cancel a pending ride (passengers only)' })
  cancelRide(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.rideService.cancelRide(id, user.sub);
  }

  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Accept a ride (drivers only)' })
  acceptRide(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AcceptRideDto,
  ) {
    return this.rideService.acceptRide(id, user.sub, dto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Advance ride status (drivers only): ARRIVED → IN_PROGRESS → COMPLETED' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateRideStatusDto,
  ) {
    return this.rideService.updateRideStatus(id, user.sub, dto);
  }
}
