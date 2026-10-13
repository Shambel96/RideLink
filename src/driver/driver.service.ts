import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriverAvailabilityStatus, DriverVerificationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { VerifyDriverDto } from './dto/verify-driver.dto';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: RegisterDriverDto) {
    const existing = await this.prisma.driver.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('You have already registered as a driver');

    const licenseExists = await this.prisma.driver.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (licenseExists) throw new ConflictException('License number is already registered');

    const [driver] = await this.prisma.$transaction([
      this.prisma.driver.create({
        data: { userId, licenseNumber: dto.licenseNumber },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { roles: { push: UserRole.DRIVER } },
      }),
    ]);

    return driver;
  }

  async getMyProfile(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        vehicles: true,
      },
    });
    if (!driver) throw new NotFoundException('Driver profile not found');
    return driver;
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new NotFoundException('Driver profile not found');

    if (driver.verificationStatus !== DriverVerificationStatus.APPROVED) {
      throw new ForbiddenException('Your driver account is not approved yet');
    }

    if (dto.status === DriverAvailabilityStatus.AVAILABLE) {
      if (dto.latitude === undefined || dto.longitude === undefined) {
        throw new BadRequestException('Latitude and longitude are required when going AVAILABLE');
      }
    }

    return this.prisma.driver.update({
      where: { userId },
      data: {
        availabilityStatus: dto.status,
        currentLatitude: dto.latitude !== undefined ? dto.latitude : undefined,
        currentLongitude: dto.longitude !== undefined ? dto.longitude : undefined,
      },
    });
  }

  async findAll(params: { page?: number; limit?: number; status?: DriverVerificationStatus }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where = params.status ? { verificationStatus: params.status } : {};

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, phone: true } }, vehicles: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return { drivers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        vehicles: true,
        rides: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async verify(id: string, adminId: string, dto: VerifyDriverDto) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.driver.update({
      where: { id },
      data: {
        verificationStatus: dto.status,
        rejectionReason: dto.rejectionReason || null,
        verifiedAt: dto.status === DriverVerificationStatus.APPROVED ? new Date() : undefined,
        verifiedBy: dto.status === DriverVerificationStatus.APPROVED ? adminId : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
}
