import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaAuthRepository } from './prisma.auth.repository';
import { AuthRepository } from './auth.repository';
import { PrismaVerificationRepository } from './prisma.verification.repository';
import { VerificationRepository } from './verification.repository';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        { provide: AuthRepository, useClass: PrismaAuthRepository },
        { provide: VerificationRepository, useClass: PrismaVerificationRepository },
    ],
})
export class AuthModule {}
