import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaAuthRepository } from './prisma.auth.repository';
import { AuthRepository } from './auth.repository';
import { PrismaVerificationRepository } from './prisma.verification.repository';
import { VerificationRepository } from './verification.repository';
import { PasswordResetRepository } from './password-reset.repository';
import { PrismaPasswordResetRepository } from './prisma.password-reset.repository';
import { VerificationService } from './verification.service';
import { PasswordService } from 'src/common/password.service';
import { CookieService } from 'src/common/cookie.service';
import { DeviceService } from 'src/common/device.service';
import { VerificationController } from './verification.controller';

@Module({
    controllers: [AuthController, VerificationController],
    providers: [
        AuthService,
        VerificationService,
        PasswordService,
        CookieService,
        DeviceService,
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        { provide: VerificationRepository, useClass: PrismaVerificationRepository },
        { provide: PasswordResetRepository, useClass: PrismaPasswordResetRepository },
    ],
})
export class AuthModule {}
