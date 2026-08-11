export type VerificationRecord = {
    id: string;
    email: string;
    token: string;
    code: string;
    expires: string;
    createdAt: string;
    updatedAt: string;
};

export abstract class VerificationRepository {
    abstract findByEmail(email: string): Promise<VerificationRecord | null>;
    abstract upsert(email: string, code: string, token: string, expires: string): Promise<void>;
    abstract updateCode(id: string, code: string): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
