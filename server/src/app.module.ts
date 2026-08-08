import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountModule } from './account/account.module';
import { LikesModule } from './threads/likes.module';
import { ThreadsModule } from './threads/threads.module';
import { SavedModule } from './saved/saved.module';
import { SearchModule } from './search/search.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), '..', 'frontend', 'dist'),
            exclude: ['/api/{*path}'],
        }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
        PrismaModule,
        AuthModule,
        UsersModule,
        AccountModule,
        MailModule,
        LikesModule,
        ThreadsModule,
        SavedModule,
        SearchModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
