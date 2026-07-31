import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    findProfile(username: string) {
        return `This action returns ${username} profile`;
    }

    findTestAccounts() {
        return 'This action returns all the test accounts for client side testing in the fake portofolio';
    }
}
