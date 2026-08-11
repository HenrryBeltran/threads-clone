export type PasswordResetRecord = {
    id: string;
    email: string;
    token: string;
    expires: string;
    createdAt: string;
    updatedAt: string;
};

export abstract class PasswordResetRepository {
    abstract findByToken(token: string): Promise<PasswordResetRecord | null>;
    abstract findByEmail(email: string): Promise<PasswordResetRecord | null>;
    abstract create(email: string, token: string, expires: string): Promise<void>;
    abstract updateToken(id: string, token: string, expires: string): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
