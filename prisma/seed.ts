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
  console.log('🌱 Starting RideLink database seeding...\n');

  const hash = (password: string) => bcrypt.hash(password, 10);

  // --------------------------------------------------
  // 1. ADMIN
  // --------------------------------------------------

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

  // --------------------------------------------------
  // 2. PASSENGERS
  // --------------------------------------------------

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

  console.log('✅ Passengers created');

  // --------------------------------------------------
  // 3. APPROVED DRIVER
  // --------------------------------------------------

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

  console.log('✅ Approved driver:', driverUser1.email);

  // --------------------------------------------------
  // 4. PENDING DRIVER
  // --------------------------------------------------

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

  const driver2 = await prisma.driver.upsert({
    where: { userId: driverUser2.id },
    update: {},
    create: {
      userId: driverUser2.id,
      licenseNumber: 'DL-AA-00002222',
      verificationStatus: DriverVerificationStatus.PENDING,
    },
  });

  console.log('✅ Pending driver:', driverUser2.email);

  // --------------------------------------------------
  // 5. ADDITIONAL APPROVED DRIVER
  // --------------------------------------------------

  const driverUser3 = await prisma.user.upsert({
    where: { email: 'dawit.driver@example.com' },
    update: {},
    create: {
      name: 'Dawit Alemu',
      email: 'dawit.driver@example.com',
      password: await hash('Driver@1234'),
      phone: '+251911000006',
      roles: [UserRole.PASSENGER, UserRole.DRIVER],
    },
  });

  const driver3 = await prisma.driver.upsert({
    where: { userId: driverUser3.id },
    update: {},
    create: {
      userId: driverUser3.id,
      licenseNumber: 'DL-AA-00003333',
      verificationStatus: DriverVerificationStatus.APPROVED,
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      currentLatitude: 9.01,
      currentLongitude: 38.76,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: '3-AA-67890' },
    update: {},
    create: {
      driverId: driver3.id,
      plateNumber: '3-AA-67890',
      model: 'Toyota Yaris',
      type: VehicleType.SEDAN,
      year: 2022,
    },
  });

  console.log('✅ Additional approved driver:', driverUser3.email);

  // --------------------------------------------------
  // 6. SAMPLE RIDES
  // --------------------------------------------------

  const existingRide = await prisma.ride.findFirst({
    where: {
      passengerId: passenger1.id,
      status: RideStatus.COMPLETED,
    },
  });

  if (!existingRide) {
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

    console.log('✅ Completed ride created');
  }

  // --------------------------------------------------
  // 7. RIDE TEST SCENARIOS
  // --------------------------------------------------

  console.log('\n🎉 RideLink seed completed successfully!');

  console.log('\n========== TEST ACCOUNTS ==========');
  console.log('ADMIN');
  console.log('Email: admin@ridelink.com');
  console.log('Password: Admin@1234');

  console.log('\nPASSENGERS');
  console.log('Email: abebe@example.com');
  console.log('Password: Passenger@123');

  console.log('\nEmail: tigist@example.com');
  console.log('Password: Passenger@123');

  console.log('\nAPPROVED DRIVER');
  console.log('Email: kebede.driver@example.com');
  console.log('Password: Driver@1234');

  console.log('\nPENDING DRIVER');
  console.log('Email: selam.driver@example.com');
  console.log('Password: Driver@1234');

  console.log('\nADDITIONAL APPROVED DRIVER');
  console.log('Email: dawit.driver@example.com');
  console.log('Password: Driver@1234');

  console.log('\n===================================\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
