import { Controller, Delete, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthRequest } from 'src/auth/auth-request';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { SessionGuard } from 'src/auth/guards/session.guard';
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
    getHistory(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.searchService.getHistory(request.user.id);
    }

    @Post('/history/:targetId')
    @HttpCode(200)
    @UseGuards(GetUserGuard)
    async addHistory(
        @Param('targetId') targetId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        await this.searchService.addHistory(request.user.id, targetId, response);
    }

    @Delete('/history')
    @UseGuards(GetUserGuard)
    async clearHistory(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        await this.searchService.clearHistory(request.user.id, response);
    }

    @Delete('/history/:rowId')
    @UseGuards(SessionGuard)
    async deleteRow(
        @Param('rowId') rowId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        await this.searchService.deleteRow(rowId, response);
    }
}
