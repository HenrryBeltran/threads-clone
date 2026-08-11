import { IsEmail, IsString } from 'class-validator';

export class NewEmailDto {
    @IsString({ message: 'Invalid email' })
    @IsEmail({}, { message: 'Invalid email' })
    newEmail!: string;
}
