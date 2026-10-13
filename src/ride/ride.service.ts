import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DriverAvailabilityStatus,
  DriverVerificationStatus,
  RideStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestRideDto } from './dto/request-ride.dto';
import { AcceptRideDto } from './dto/accept-ride.dto';
import { UpdateRideStatusDto } from './dto/update-ride-status.dto';
import { calculateFare } from '../common/utils/haversine.util';

const RIDE_INCLUDE = {
  passenger: { select: { id: true, name: true, phone: true } },
  driver: {
    include: {
      user: { select: { id: true, name: true, phone: true } },
    },
  },
  vehicle: true,
} as const;

@Injectable()
export class RideService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async requestRide(passengerId: string, dto: RequestRideDto) {
    // Check passenger doesn't have an active ride
    const activeRide = await this.prisma.ride.findFirst({
      where: {
        passengerId,
        status: {
          notIn: [RideStatus.COMPLETED, RideStatus.CANCELLED],
        },
      },
    });
    if (activeRide) {
      throw new BadRequestException('You already have an active ride in progress');
    }

    const baseRate = this.config.get<number>('app.fareBaseRate') || 15;
    const perKmRate = this.config.get<number>('app.farePerKm') || 8;

    const estimatedFare = calculateFare(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.destinationLatitude,
      dto.destinationLongitude,
      baseRate,
      perKmRate,
    );

    const ride = await this.prisma.ride.create({
      data: {
        passengerId,
        pickupLatitude: dto.pickupLatitude,
        pickupLongitude: dto.pickupLongitude,
        destinationLatitude: dto.destinationLatitude,
        destinationLongitude: dto.destinationLongitude,
        fare: estimatedFare,
        status: RideStatus.SEARCHING,
      },
      include: RIDE_INCLUDE,
    });

    return ride;
  }

  async getMyRides(userId: string, role: 'passenger' | 'driver', page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let where: Record<string, unknown>;
    if (role === 'driver') {
      const driver = await this.prisma.driver.findUnique({ where: { userId } });
      if (!driver) throw new NotFoundException('Driver profile not found');
      where = { driverId: driver.id };
    } else {
      where = { passengerId: userId };
    }

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take: limit,
        include: RIDE_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ride.count({ where }),
    ]);

    return { rides, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRideById(id: string, userId: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id },
      include: {
        ...RIDE_INCLUDE,
        driver: {
          include: { user: { select: { id: true, name: true, phone: true } } },
        },
      },
    });
    if (!ride) throw new NotFoundException('Ride not found');

    const driver = ride.driverId
      ? await this.prisma.driver.findUnique({ where: { id: ride.driverId } })
      : null;

    const isPassenger = ride.passengerId === userId;
    const isDriver = driver?.userId === userId;

    if (!isPassenger && !isDriver) {
      throw new ForbiddenException('Access denied');
    }

    return ride;
  }

  async cancelRide(id: string, passengerId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.passengerId !== passengerId) throw new ForbiddenException('Access denied');

    const cancellableStatuses: RideStatus[] = [RideStatus.REQUESTED, RideStatus.SEARCHING, RideStatus.DRIVER_ASSIGNED];
    if (!cancellableStatuses.includes(ride.status)) {
      throw new BadRequestException(`Cannot cancel a ride with status: ${ride.status}`);
    }

    const updated = await this.prisma.ride.update({
      where: { id },
      data: { status: RideStatus.CANCELLED },
      include: RIDE_INCLUDE,
    });

    // Make driver available again if one was assigned
    if (ride.driverId) {
      await this.prisma.driver.update({
        where: { id: ride.driverId },
        data: { availabilityStatus: DriverAvailabilityStatus.AVAILABLE },
      });
    }

    return updated;
  }

  async getAvailableRides(userId: string, page = 1, limit = 10) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new NotFoundException('Driver profile not found');

    if (driver.verificationStatus !== DriverVerificationStatus.APPROVED) {
      throw new ForbiddenException('Only approved drivers can view available rides');
    }
    if (driver.availabilityStatus !== DriverAvailabilityStatus.AVAILABLE) {
      throw new BadRequestException('Set your status to AVAILABLE before viewing rides');
    }

    const skip = (page - 1) * limit;
    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: { status: RideStatus.SEARCHING },
        skip,
        take: limit,
        include: { passenger: { select: { id: true, name: true, phone: true } } },
        orderBy: { requestedAt: 'asc' },
      }),
      this.prisma.ride.count({ where: { status: RideStatus.SEARCHING } }),
    ]);

    return { rides, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async acceptRide(rideId: string, userId: string, dto: AcceptRideDto) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new NotFoundException('Driver profile not found');

    if (driver.verificationStatus !== DriverVerificationStatus.APPROVED) {
      throw new ForbiddenException('Only approved drivers can accept rides');
    }

    // Verify vehicle belongs to driver
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, driverId: driver.id },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found or does not belong to you');

    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.status !== RideStatus.SEARCHING) {
      throw new BadRequestException('This ride is no longer available');
    }

    const [updatedRide] = await this.prisma.$transaction([
      this.prisma.ride.update({
        where: { id: rideId },
        data: {
          driverId: driver.id,
          vehicleId: dto.vehicleId,
          status: RideStatus.DRIVER_ASSIGNED,
        },
        include: RIDE_INCLUDE,
      }),
      this.prisma.driver.update({
        where: { id: driver.id },
        data: { availabilityStatus: DriverAvailabilityStatus.BUSY },
      }),
    ]);

    return updatedRide;
  }

  async updateRideStatus(rideId: string, userId: string, dto: UpdateRideStatusDto) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) throw new NotFoundException('Driver profile not found');

    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.driverId !== driver.id) throw new ForbiddenException('Access denied');

    // Enforce valid transitions
    const validTransitions: Partial<Record<RideStatus, RideStatus>> = {
      [RideStatus.DRIVER_ASSIGNED]: RideStatus.DRIVER_ARRIVED,
      [RideStatus.DRIVER_ARRIVED]: RideStatus.IN_PROGRESS,
      [RideStatus.IN_PROGRESS]: RideStatus.COMPLETED,
    };

    if (validTransitions[ride.status] !== dto.status) {
      throw new BadRequestException(
        `Cannot transition from ${ride.status} to ${dto.status}. Expected: ${validTransitions[ride.status] ?? 'N/A'}`,
      );
    }

    const updateData: Record<string, unknown> = { status: dto.status };
    if (dto.status === RideStatus.IN_PROGRESS) updateData.startedAt = new Date();
    if (dto.status === RideStatus.COMPLETED) {
      updateData.completedAt = new Date();
      // Free up the driver
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: { availabilityStatus: DriverAvailabilityStatus.AVAILABLE },
      });
    }

    return this.prisma.ride.update({
      where: { id: rideId },
      data: updateData,
      include: RIDE_INCLUDE,
    });
  }
}
