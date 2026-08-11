import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Length, MaxLength, ValidateIf, ValidateNested } from 'class-validator';

export class CreateThreadBody {
    @IsString()
    @MaxLength(500)
    text!: string;

    @IsOptional()
    @ValidateIf((_, value) => value !== null)
    @IsArray()
    @IsString({ each: true })
    resources?: string[] | null;
}

export class CreateThreadDto {
    @ValidateIf((_, value) => value !== null)
    @IsString()
    @Length(21, 21)
    rootId!: string | null;

    @ValidateIf((_, value) => value !== null)
    @IsString()
    @Length(21, 21)
    parentId!: string | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateThreadBody)
    body!: CreateThreadBody[];
}
