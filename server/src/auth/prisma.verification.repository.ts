import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { VerificationRecord, VerificationRepository } from './verification.repository';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaVerificationRepository implements VerificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByEmail(email: string): Promise<VerificationRecord | null> {
        return await this.prisma.verify_user.findFirst({ where: { email } });
    }

    async upsert(email: string, code: string, token: string, expires: string): Promise<void> {
        let existing: VerificationRecord | null = null;
        try {
            existing = await this.prisma.verify_user.findFirst({ where: { email } });
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (existing) {
            try {
                await this.prisma.verify_user.update({
                    where: { id: existing.id },
                    data: { code, token, expires, updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss') },
                });
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        } else {
            try {
                await this.prisma.verify_user.create({ data: { id: nanoid(), email, code, token, expires } });
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        }
    }

    async updateCode(id: string, code: string): Promise<void> {
        await this.prisma.verify_user.update({
            where: { id },
            data: { code, updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss') },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.verify_user.delete({ where: { id } });
    }
}
