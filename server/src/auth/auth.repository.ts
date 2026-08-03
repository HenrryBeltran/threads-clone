import { CreateSessionData } from './prisma.auth.repository';

export type UserAuth = {
    id: string;
    email: string;
    username: string;
    password: string;
    emailVerified: string | null;
    roles: string;
};

export abstract class AuthRepository {
    abstract findRegisteredUser(usernameOrEmail: string): Promise<UserAuth | null>;
    abstract createUserSession(data: CreateSessionData): Promise<void>;
}
