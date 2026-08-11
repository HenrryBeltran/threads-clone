import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const url = process.env.DATABASE_URL as string;
        const adapter = url.startsWith('file:')
            ? new PrismaBetterSqlite3({ url })
            : new PrismaLibSql({
                  url,
                  authToken: process.env.DATABASE_AUTH_TOKEN,
              });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
