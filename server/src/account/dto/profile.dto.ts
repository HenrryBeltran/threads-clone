import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProfilePictureDto {
    @IsString()
    @Matches(/data:image\/jpeg;base64,/, { message: 'Invalid base64 format.' })
    @MaxLength(7_000_000, { message: 'Image is too large.' })
    base64!: string;
}

export class ProfileDto {
    @IsNotEmpty({ message: 'Name is required.' })
    @MinLength(2, { message: 'User name must be at least 2 characters.' })
    @MaxLength(48, { message: 'Username cannot exceed 48 characters.' })
    name!: string;

    @IsString({ message: 'Biography must be less then 150 characters.' })
    @MaxLength(150, { message: 'Biography must be less then 150 characters.' })
    bio!: string;

    @IsOptional()
    @ValidateIf((_, value) => value !== '')
    @IsUrl({}, { message: 'Invalid url.' })
    @MaxLength(60, { message: 'Link cannot be longer than 60 characters.' })
    link?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ProfilePictureDto)
    profilePicture?: ProfilePictureDto;
}
