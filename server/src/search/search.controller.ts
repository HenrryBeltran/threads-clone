import { Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthRequest } from 'src/auth/auth-request';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { SessionGuard } from 'src/auth/guards/session.guard';
import { NoContentException } from 'src/common/no-content.exception';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get('/:userId/:keywords')
    search(@Param('userId') userId: string, @Param('keywords') keywords: string) {
        return this.searchService.search(userId, keywords);
    }

    @Get('/history')
    @UseGuards(GetUserGuard)
    getHistory(@Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.searchService.getHistory(request.user.id);
    }

    @Post('/history/:targetId')
    @HttpCode(200)
    @UseGuards(GetUserGuard)
    async addHistory(@Param('targetId') targetId: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.searchService.addHistory(request.user.id, targetId);
    }

    @Delete('/history')
    @UseGuards(GetUserGuard)
    async clearHistory(@Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.searchService.clearHistory(request.user.id);
    }

    @Delete('/history/:rowId')
    @UseGuards(SessionGuard)
    async deleteRow(@Param('rowId') rowId: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.searchService.deleteRow(rowId);
    }
}
