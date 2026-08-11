import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from './custom-validators';

export class SignUpDto {
    @IsString({ message: 'Username must be a string.' })
    @IsNotEmpty({ message: 'Username is required.' })
    @MinLength(3, { message: 'Username must be at least 3 characters.' })
    @MaxLength(30, { message: 'Username cannot exceed 30 characters.' })
    @Matches(/^[^ ]*$/, { message: 'Username cannot have spaces.' })
    @Matches(/^(?!\.).*(?<!\.)$/, { message: 'Contains misplaced special characters.' })
    @Matches(/^[a-zA-Z_\d]([a-zA-Z\d_]*\.?[a-zA-Z\d_]+)*$/, {
        message: 'Invalid special characters.\n\nUnderscores and dots are valid.',
    })
    username!: string;

    @IsString({ message: 'Email must be a string.' })
    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail()
    email!: string;

    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @MaxLength(30, { message: 'Password cannot execeed 30 characters long.' })
    @Matches(/[0-9]/, { message: 'Password must contain a number.' })
    @Matches(/[a-z]/, { message: 'Password must contain an lowercase letter.' })
    @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
    password!: string;

    @IsString({ message: 'Confirm password must be a string.' })
    @IsNotEmpty({ message: 'Confirm password is required.' })
    @Match('password', { message: 'Passwords do not match.' })
    confirmPassword!: string;
}
