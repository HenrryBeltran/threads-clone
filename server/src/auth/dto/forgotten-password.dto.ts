import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ForgottenPasswordDto {
    @IsString({ message: 'Email must be a string.' })
    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail()
    email!: string;
}
