import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Vehicles')
@ApiBearerAuth('access-token')
@Roles(UserRole.DRIVER)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Add a vehicle (approved drivers only)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my vehicles' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.vehicleService.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vehicle' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a vehicle' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.remove(id, user.sub);
  }
}
