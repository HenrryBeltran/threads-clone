import { Body, Controller, Get, Injectable, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { GetUserGuard } from './guards/get-user.guard';
import { AuthRequest } from './auth-request';
import { VerificationService } from './verification.service';

@Injectable()
@Controller('verify-account')
@UseGuards(GetUserGuard)
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Post('/')
    async verifyAccount(
        @Body() dto: VerifyPinDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        response.json(await this.verificationService.verifyAccount(request.user, dto.pin));
    }

    @Get('/token')
    async getToken(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        response.json(await this.verificationService.getVerificationToken(request.user));
    }

    @Get('/resend')
    async resend(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        response.json(await this.verificationService.resend(request.user));
    }
}
