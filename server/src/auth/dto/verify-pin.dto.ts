import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyPinDto {
    @IsString({ message: 'Pin must be a string.' })
    @IsNotEmpty({ message: 'Pin is required.' })
    @MinLength(6, { message: 'Your one-time password must be 6 characters.' })
    pin!: string;
}
