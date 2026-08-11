import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UsersRepository, UserProfile, TestAccount } from './users.repository';

export type ResponseTestAccount = TestAccount & { password: string };

@Injectable()
export class UsersService {
    constructor(private readonly repo: UsersRepository) {}

    async findProfile(username: string): Promise<UserProfile> {
        let profile: UserProfile | null = null;

        try {
            profile = await this.repo.getProfileByUsername(username);
        } catch (e) {
            Logger.error(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!profile) {
            throw new NotFoundException('User profile not found.');
        }

        return profile;
    }

    async findTestAccounts(): Promise<ResponseTestAccount[]> {
        let accounts: TestAccount[] = [];
        try {
            accounts = await this.repo.getTestAccounts();
        } catch (e) {
            Logger.error(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return accounts.map((fake) => ({ ...fake, password: '123456Clone' }));
    }
}
