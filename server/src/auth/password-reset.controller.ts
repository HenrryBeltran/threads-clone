import { Body, Controller, Get, Injectable, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PasswordResetService } from './password-reset.service';
import { ForgottenPasswordDto } from './dto/forgotten-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
@Controller('auth')
export class PasswordResetController {
    constructor(private readonly passwordResetService: PasswordResetService) {}

    @Get('/reset-password/:temporal-token')
    validateResetToken(@Param('temporal-token') temporalToken: string) {
        return this.passwordResetService.validateResetToken(temporalToken);
    }

    @Post('/reset-password/:temporal-token')
    resetPassword(@Param('temporal-token') temporalToken: string, @Body() resetPasswordDto: ResetPasswordDto) {
        return this.passwordResetService.resetPassword(temporalToken, resetPasswordDto.newPassword);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 600_000 } })
    @Post('/forgotten-password')
    forgottenPassword(@Body() forgottenPasswordDto: ForgottenPasswordDto) {
        return this.passwordResetService.forgottenPassword(forgottenPasswordDto.email);
    }
}
