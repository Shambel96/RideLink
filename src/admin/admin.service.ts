import { Injectable } from '@nestjs/common';
import { RideStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalDrivers,
      totalRides,
      completedRides,
      totalRevenue,
      activeRides,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.driver.count(),
      this.prisma.ride.count(),
      this.prisma.ride.count({ where: { status: RideStatus.COMPLETED } }),
      this.prisma.ride.aggregate({
        where: { status: RideStatus.COMPLETED },
        _sum: { fare: true },
      }),
      this.prisma.ride.count({
        where: {
          status: {
            notIn: [RideStatus.COMPLETED, RideStatus.CANCELLED],
          },
        },
      }),
    ]);

    return {
      users: { total: totalUsers },
      drivers: { total: totalDrivers },
      rides: {
        total: totalRides,
        completed: completedRides,
        active: activeRides,
        cancelled: totalRides - completedRides - activeRides,
      },
      revenue: {
        total: Number(totalRevenue._sum.fare ?? 0),
        currency: 'ETB',
      },
    };
  }

  async getAllUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roles: true,
          createdAt: true,
          driver: { select: { id: true, verificationStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAllRides(page = 1, limit = 10, status?: RideStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take: limit,
        include: {
          passenger: { select: { id: true, name: true, phone: true } },
          driver: { include: { user: { select: { id: true, name: true } } } },
          vehicle: { select: { plateNumber: true, model: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ride.count({ where }),
    ]);

    return { rides, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
