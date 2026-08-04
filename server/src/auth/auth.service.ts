import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(private readonly repo: AuthRepository) {}

    async login(usernameOrEmail: string, password: string, userAgent: string, ip: string, response: Response) {
        throw new Error('Method not implemented.');
    }
}
