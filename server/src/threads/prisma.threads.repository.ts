import { Injectable } from '@nestjs/common';
import { ThreadsRepository } from './threads.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaThreadsRepository implements ThreadsRepository {
    constructor(private readonly prisma: PrismaService) {}
}
