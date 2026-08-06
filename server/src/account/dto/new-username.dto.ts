import { IsNotEmpty, IsString } from 'class-validator';

export class NewUsernameDto {
    @IsString({ message: 'New username must be a string.' })
    @IsNotEmpty({ message: 'New username is required.' })
    newUsername!: string;
}
