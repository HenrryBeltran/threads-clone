import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from './custom-validators';

export class ResetPasswordDto {
    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @MaxLength(30, { message: 'Password cannot execeed 30 characters long.' })
    @Matches(/[0-9]/, { message: 'Password must contain a number.' })
    @Matches(/[a-z]/, { message: 'Password must contain an lowercase letter.' })
    @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
    newPassword!: string;

    @IsString({ message: 'Confirm password must be a string.' })
    @IsNotEmpty({ message: 'Confirm password is required.' })
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @MaxLength(30, { message: 'Password cannot execeed 30 characters long.' })
    @Matches(/[0-9]/, { message: 'Password must contain a number.' })
    @Matches(/[a-z]/, { message: 'Password must contain an lowercase letter.' })
    @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
    @Match('newPassword', { message: 'Passwords do not match.' })
    confirmNewPassword!: string;
}
