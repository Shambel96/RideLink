import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const prismaMock = {
    $queryRaw: jest.fn().mockResolvedValue([[{ '?column?': 1 }]]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PrismaService, useValue: prismaMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return the service health status', async () => {
      await expect(appController.health()).resolves.toEqual({
        status: 'ok',
        database: 'connected',
        timestamp: expect.any(String),
      });
      expect(prismaMock.$queryRaw).toHaveBeenCalled();
    });
  });
});
