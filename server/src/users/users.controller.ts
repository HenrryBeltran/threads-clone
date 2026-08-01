import { Controller, Get, Param } from '@nestjs/common';
import { ResponseTestAccount, UsersService } from './users.service';
import { UserProfile } from './users.repository';

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/profile/:username')
    async getUserProfile(@Param('username') username: string): Promise<UserProfile> {
        return this.usersService.findProfile(username);
    }

    @Get('/test-accounts')
    async getUserTestAccounts(): Promise<ResponseTestAccount[]> {
        return this.usersService.findTestAccounts();
    }
}
