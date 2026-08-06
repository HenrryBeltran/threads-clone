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
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
    controllers: [AuthController, VerificationController, PasswordResetController, SessionsController],
    providers: [
        AuthService,
        VerificationService,
        PasswordResetService,
        SessionsService,
        PasswordService,
        CookieService,
        DeviceService,
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        { provide: VerificationRepository, useClass: PrismaVerificationRepository },
        { provide: PasswordResetRepository, useClass: PrismaPasswordResetRepository },
    ],
    exports: [AuthRepository],
})
export class AuthModule {}
