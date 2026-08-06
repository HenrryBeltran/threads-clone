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

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), '..', 'frontend', 'dist'),
            exclude: ['/api/{*path}'],
        }),
        ThrottlerModule.forRoot(),
        PrismaModule,
        AuthModule,
        UsersModule,
        AccountModule,
        MailModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
