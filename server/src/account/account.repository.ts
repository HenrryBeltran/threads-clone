export type Profile = {
    name: string;
    bio: string;
    link: string | null;
    profilePictureId: string | null;
};

export type VerifyEmailRecord = {
    id: string;
    newEmail: string;
    expires: string;
};

export abstract class AccountRepository {
    abstract findPasswordById(userId: string): Promise<{ password: string } | null>;
    abstract updateProfile(userId: string, profileData: Profile): Promise<void>;
    abstract updateUsername(userId: string, username: string): Promise<void>;
    abstract updateEmail(userId: string, newEmail: string): Promise<void>;
    abstract updatePassword(userId: string, newPassword: string): Promise<void>;
    abstract deleteUser(userId: string): Promise<void>;
    abstract updateCounts(userId: string, followersCount: number, followingsCount: number): Promise<void>;
    abstract countFollowers(userId: string): Promise<number>;
    abstract countFollowings(userId: string): Promise<number>;
    abstract findIdByEmail(email: string): Promise<{ id: string } | null>;
    abstract findIdByUsername(username: string): Promise<{ id: string } | null>;
    abstract findVerifyEmailByOldEmail(oldEmail: string): Promise<{ id: string } | null>;
    abstract findVerifyEmailByTokenAndOldEmail(token: string, oldEmail: string): Promise<VerifyEmailRecord | null>;
    abstract createVerifyEmail(data: {
        id: string;
        oldEmail: string;
        newEmail: string;
        expires: string;
        token: string;
    }): Promise<void>;
    abstract updateVerifyEmail(id: string, data: { newEmail: string; expires: string; token: string }): Promise<void>;
    abstract deleteVerifyEmail(id: string): Promise<void>;
}
