import { Module } from '@nestjs/common';
import { AccountUserController } from './account-user.controller';
import { AccountUserService } from './account-user.service';
import { CookieService } from 'src/common/cookie.service';
import { PasswordService } from 'src/common/password.service';
import { PrismaAccountRepository } from './prisma.account.repository';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { AccountRepository } from './account.repository';
import { AccountProfileController } from './account-profile.controller';
import { AccountProfileService } from './account-profile.service';
import { ActivityService } from './activity.service';
import { FollowRepository } from './follow.repository';
import { PrismaFollowRepository } from './prisma.follow.repository';
import { ActivityRepository } from './activity.repository';
import { PrismaActivityRepository } from './prisma.activity.repository';

@Module({
    imports: [AuthModule],
    controllers: [AccountUserController, AccountProfileController],
    providers: [
        AccountUserService,
        AccountProfileService,
        ActivityService,
        CloudinaryService,
        CookieService,
        PasswordService,
        { provide: AccountRepository, useClass: PrismaAccountRepository },
        { provide: FollowRepository, useClass: PrismaFollowRepository },
        { provide: ActivityRepository, useClass: PrismaActivityRepository },
    ],
    exports: [ActivityService, ActivityRepository, FollowRepository],
})
export class AccountModule {}
