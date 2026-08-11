import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
    hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
