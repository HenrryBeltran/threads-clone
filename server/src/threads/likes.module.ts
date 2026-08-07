import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikesRepository } from './likes.repository';
import { PrismaLikesRepository } from './prisma.likes.repository';
import { AccountModule } from 'src/account/account.module';
import { AuthModule } from 'src/auth/auth.module';
import { CookieService } from 'src/common/cookie.service';

@Module({
    imports: [AuthModule, AccountModule],
    controllers: [LikesController],
    providers: [LikesService, CookieService, { provide: LikesRepository, useClass: PrismaLikesRepository }],
})
export class LikesModule {}
