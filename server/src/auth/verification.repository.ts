export type VerificationToken = { id: string; token: string };

export abstract class VerificationRepository {
    abstract findByEmail(email: string): Promise<VerificationToken | null>;
    abstract upsert(email: string, code: string, token: string, expires: string): Promise<void>;
    abstract updateCode(id: string, code: string, updatedAt: string): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
