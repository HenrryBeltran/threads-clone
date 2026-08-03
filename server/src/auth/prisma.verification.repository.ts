import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { VerificationRepository, VerificationToken } from './verification.repository';

@Injectable()
export class PrismaVerificationRepository implements VerificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    findByEmail(email: string): Promise<VerificationToken | null> {
        throw new Error('Method not implemented.');
    }

    upsert(email: string, code: string, token: string, expires: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    updateCode(id: string, code: string, updatedAt: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
