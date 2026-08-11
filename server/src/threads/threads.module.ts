import { Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { ThreadsRepository } from './threads.repository';
import { PrismaThreadsRepository } from './prisma.threads.repository';
import { AuthModule } from 'src/auth/auth.module';
import { AccountModule } from 'src/account/account.module';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { CookieService } from 'src/common/cookie.service';

@Module({
    imports: [AuthModule, AccountModule],
    controllers: [ThreadsController],
    providers: [
        ThreadsService,
        CloudinaryService,
        CookieService,
        { provide: ThreadsRepository, useClass: PrismaThreadsRepository },
    ],
    exports: [ThreadsRepository],
})
export class ThreadsModule {}
