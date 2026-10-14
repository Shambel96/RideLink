import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriverVerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  private async getApprovedDriver(userId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new NotFoundException('Driver profile not found. Register as a driver first.');
    if (driver.verificationStatus !== DriverVerificationStatus.APPROVED) {
      throw new ForbiddenException('Only approved drivers can manage vehicles');
    }
    return driver;
  }

  async create(userId: string, dto: CreateVehicleDto) {
    const driver = await this.getApprovedDriver(userId);

    const existing = await this.prisma.vehicle.findUnique({
      where: { plateNumber: dto.plateNumber },
    });
    if (existing) throw new ConflictException('A vehicle with this plate number already exists');

    return this.prisma.vehicle.create({
      data: { ...dto, driverId: driver.id },
    });
  }

  async findMine(userId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new NotFoundException('Driver profile not found');
    return this.prisma.vehicle.findMany({ where: { driverId: driver.id }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { driver: { select: { userId: true } } },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.driver.userId !== userId) throw new ForbiddenException('Access denied');
    return vehicle;
  }

  async update(id: string, userId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id, userId);

    if (dto.plateNumber && dto.plateNumber !== vehicle.plateNumber) {
      const existing = await this.prisma.vehicle.findUnique({
        where: { plateNumber: dto.plateNumber },
      });
      if (existing) throw new ConflictException('Plate number already in use');
    }

    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.vehicle.delete({ where: { id } });
    return { message: 'Vehicle removed successfully' };
  }
}
