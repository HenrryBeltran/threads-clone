import { Module } from '@nestjs/common';
import { AccountUserController } from './account-user.controller';
import { AccountUserService } from './account-user.service';
import { CookieService } from 'src/common/cookie.service';
import { PasswordService } from 'src/common/password.service';
import { PrismaAccountRepository } from './prisma.account.repository';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { AccountRepository } from './account.repository';

@Module({
    imports: [AuthModule],
    controllers: [AccountUserController],
    providers: [
        AccountUserService,
        CloudinaryService,
        CookieService,
        PasswordService,
        { provide: AccountRepository, useClass: PrismaAccountRepository },
    ],
})
export class AccountModule {}
