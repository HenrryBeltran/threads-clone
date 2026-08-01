export type UserProfile = {
    id: string;
    username: string;
    name: string;
    bio: string;
    link: string | null;
    profilePictureId: string | null;
    followersCount: number;
    followingsCount: number;
};

export type TestAccount = {
    username: string;
    name: string;
    profilePictureId: string | null;
};

export abstract class UsersRepository {
    abstract getProfileByUsername(username: string): Promise<UserProfile | null>;
    abstract getTestAccounts(): Promise<TestAccount[]>;
}
