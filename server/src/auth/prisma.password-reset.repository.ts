import { Injectable } from '@nestjs/common';
import { PasswordResetRecord, PasswordResetRepository } from './password-reset.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByToken(token: string): Promise<PasswordResetRecord | null> {
        return await this.prisma.reset_password.findUnique({ where: { token } });
    }

    async findByEmail(email: string): Promise<PasswordResetRecord | null> {
        return await this.prisma.reset_password.findUnique({ where: { email } });
    }

    async create(email: string, token: string, expires: string): Promise<void> {
        await this.prisma.reset_password.create({
            data: {
                id: nanoid(),
                email,
                token,
                expires,
            },
        });
    }

    async updateToken(id: string, token: string, expires: string): Promise<void> {
        await this.prisma.reset_password.update({
            where: { id },
            data: {
                token,
                expires,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.reset_password.delete({ where: { id } });
    }
}
