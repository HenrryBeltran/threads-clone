import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { CloudinaryService } from '../src/common/cloudinary.service';

export const createMailMock = () => ({
  sendWelcome: jest.fn().mockResolvedValue(undefined),
  sendResetPassword: jest.fn().mockResolvedValue(undefined),
  sendResetPasswordConfirmation: jest.fn().mockResolvedValue(undefined),
  sendNewEmailRequest: jest.fn().mockResolvedValue(undefined),
  sendNewEmailConfirmation: jest.fn().mockResolvedValue(undefined),
});

export const createCloudinaryMock = () => ({
  upload: jest.fn().mockResolvedValue('fake-cloudinary-id'),
  destroy: jest.fn().mockResolvedValue(undefined),
});

export async function createTestApp(overrides: {
  mailMock?: ReturnType<typeof createMailMock>;
  cloudinaryMock?: ReturnType<typeof createCloudinaryMock>;
  throttleLimit?: number;
} = {}): Promise<INestApplication> {
  const mailMock = overrides.mailMock ?? createMailMock();
  const cloudinaryMock = overrides.cloudinaryMock ?? createCloudinaryMock();
  const throttleLimit = overrides.throttleLimit ?? 1000;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: throttleLimit }]),
    ],
  })
    .overrideProvider(MailService)
    .useValue(mailMock)
    .overrideProvider(CloudinaryService)
    .useValue(cloudinaryMock)
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();
  (app as any).mailMock = mailMock;
  (app as any).cloudinaryMock = cloudinaryMock;
  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  await app.init();
  return app;
}

export function extractPinFromMailMock(mailMock: ReturnType<typeof createMailMock>): string | null {
  const calls = mailMock.sendWelcome.mock.calls;
  if (calls.length === 0) return null;
  return calls[calls.length - 1][2] as string;
}