import { Controller, Delete, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { SessionGuard } from './guards/session.guard';
import { AuthRequest } from './auth-request';
import { Response } from 'express';
import { SessionsService } from './sessions.service';

@Controller('account/sessions')
@UseGuards(SessionGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Get('/')
    async getAll(@Req() request: AuthRequest) {
        return this.sessionsService.getAll(request.user!.id, request.sessionId!);
    }

    @Delete('/:id')
    async deleteOne(
        @Param('id') id: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.sessionsService.deleteOne(id, request.user!.id, request.sessionId!, response);
    }

    @Delete('/')
    async deleteAll(@Req() request: AuthRequest) {
        return this.sessionsService.deleteAll(request.user!.id, request.sessionId!);
    }
}
