import {
  PrismaClient,
  UserRole,
  DriverVerificationStatus,
  VehicleType,
  RideStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // 1. Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ridelink.com' },
    update: {},
    create: {
      name: 'RideLink Admin',
      email: 'admin@ridelink.com',
      password: await hash('Admin@1234'),
      phone: '+251911000001',
      roles: [UserRole.ADMIN, UserRole.PASSENGER],
    },
  });
  console.log('✅ Admin:', admin.email);

  // 2. Passenger 1
  const passenger1 = await prisma.user.upsert({
    where: { email: 'abebe@example.com' },
    update: {},
    create: {
      name: 'Abebe Bekele',
      email: 'abebe@example.com',
      password: await hash('Passenger@123'),
      phone: '+251911000002',
      roles: [UserRole.PASSENGER],
    },
  });
  console.log('✅ Passenger:', passenger1.email);

  // 3. Passenger 2
  const passenger2 = await prisma.user.upsert({
    where: { email: 'tigist@example.com' },
    update: {},
    create: {
      name: 'Tigist Haile',
      email: 'tigist@example.com',
      password: await hash('Passenger@123'),
      phone: '+251911000003',
      roles: [UserRole.PASSENGER],
    },
  });
  console.log('✅ Passenger:', passenger2.email);

  // 4. Approved driver
  const driverUser1 = await prisma.user.upsert({
    where: { email: 'kebede.driver@example.com' },
    update: {},
    create: {
      name: 'Kebede Girma',
      email: 'kebede.driver@example.com',
      password: await hash('Driver@1234'),
      phone: '+251911000004',
      roles: [UserRole.PASSENGER, UserRole.DRIVER],
    },
  });

  const driver1 = await prisma.driver.upsert({
    where: { userId: driverUser1.id },
    update: {},
    create: {
      userId: driverUser1.id,
      licenseNumber: 'DL-AA-00001111',
      verificationStatus: DriverVerificationStatus.APPROVED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      currentLatitude: 9.0054,
      currentLongitude: 38.7636,
    },
  });

  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: '3-AA-12345' },
    update: {},
    create: {
      driverId: driver1.id,
      plateNumber: '3-AA-12345',
      model: 'Toyota Corolla',
      type: VehicleType.SEDAN,
      year: 2020,
    },
  });
  console.log(
    '✅ Approved driver:',
    driverUser1.email,
    '| Vehicle:',
    vehicle1.plateNumber,
  );

  // 5. Pending driver
  const driverUser2 = await prisma.user.upsert({
    where: { email: 'selam.driver@example.com' },
    update: {},
    create: {
      name: 'Selam Tesfaye',
      email: 'selam.driver@example.com',
      password: await hash('Driver@1234'),
      phone: '+251911000005',
      roles: [UserRole.PASSENGER, UserRole.DRIVER],
    },
  });

  await prisma.driver.upsert({
    where: { userId: driverUser2.id },
    update: {},
    create: {
      userId: driverUser2.id,
      licenseNumber: 'DL-AA-00002222',
      verificationStatus: DriverVerificationStatus.PENDING,
    },
  });
  console.log('✅ Pending driver:', driverUser2.email);

  // 6. Completed ride
  await prisma.ride.create({
    data: {
      passengerId: passenger1.id,
      driverId: driver1.id,
      vehicleId: vehicle1.id,
      pickupLatitude: 9.0054,
      pickupLongitude: 38.7636,
      destinationLatitude: 9.0272,
      destinationLongitude: 38.7468,
      fare: 47.5,
      currency: 'ETB',
      status: RideStatus.COMPLETED,
      requestedAt: new Date(Date.now() - 3600_000),
      startedAt: new Date(Date.now() - 3000_000),
      completedAt: new Date(Date.now() - 1800_000),
    },
  });
  console.log('✅ Completed ride seeded');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Seed credentials:');
  console.log('  Admin:           admin@ridelink.com    / Admin@1234');
  console.log('  Passenger 1:     abebe@example.com     / Passenger@123');
  console.log('  Passenger 2:     tigist@example.com    / Passenger@123');
  console.log('  Driver (approved): kebede.driver@example.com / Driver@1234');
  console.log('  Driver (pending):  selam.driver@example.com  / Driver@1234\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
