import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/profile/:username')
    getUserProfile(@Param('username') username: string) {
        return this.usersService.findProfile(username);
    }

    @Get('/test-accounts')
    getUserTestAccounts() {
        return this.usersService.findTestAccounts();
    }
}
