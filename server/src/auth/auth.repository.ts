import { sessionsModel } from 'generated/prisma/models';

export type LoginAuthUser = {
    id: string;
    email: string;
    username: string;
    password: string;
    emailVerified: string | null;
    roles: string;
};

export type NewUser = {
    id: string;
    email: string;
    username: string;
    emailVerified: string | null;
};

export type CreateSessionData = {
    token: string;
    expires: string;
    userId: string;
    deviceName: string | null;
    deviceType: string | null;
    ipAddress: string | null;
    userAgent: string | null;
};

export type Session = sessionsModel;

export type SessionResponse = {
    id: string;
    userId: string;
    expires: string;
    deviceName: string | null;
    deviceType: string | null;
    ipAddress: string | null;
    lastActiveAt: string | null;
    userAgent: string | null;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AuthUser = {
    id: string;
    email: string;
    username: string;
    name: string;
    bio: string;
    link: string | null;
    profilePictureId: string | null;
    roles: string;
    followersCount: number;
    followingsCount: number;
    emailVerified: string | null;
    createdAt: string;
    updatedAt: string;
    targetId: { userId: { profilePictureId: string | null } }[];
};

export type SessionWithUser = Session & { user: AuthUser };

export abstract class AuthRepository {
    abstract findRegisteredUser(usernameOrEmail: string): Promise<LoginAuthUser | null>;
    abstract findByUsername(username: string): Promise<{ id: string } | null>;
    abstract findByEmail(email: string): Promise<{ id: string } | null>;
    abstract createUser(data: { username: string; email: string; password: string }): Promise<NewUser>;
    abstract createUserSession(data: CreateSessionData): Promise<void>;
    abstract findSessionByToken(token: string): Promise<Session | null>;
    abstract findSessionWithUserByToken(token: string): Promise<SessionWithUser | null>;
    abstract deleteSession(id: string): Promise<void>;
    abstract verifyEmail(userId: string): Promise<void>;
    abstract updatePassword(userId: string, password: string): Promise<void>;
    abstract findSessionsByUserId(userId: string): Promise<Session[]>;
    abstract deleteUserSession(sessionId: string, userId: string): Promise<boolean>;
    abstract deleteSessionsByUserId(userId: string, exceptId?: string): Promise<void>;
}
