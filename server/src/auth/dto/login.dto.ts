import {
    IsNotEmpty,
    MaxLength,
    MinLength,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

const usernamePattern = /^[a-zA-Z_\d]([a-zA-Z\d_]*\.?[a-zA-Z\d_]+)*$/;

@ValidatorConstraint({ name: 'isUsernameOrEmail', async: false })
class IsUsernameOrEmail implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        if (typeof value !== 'string' || value.length === 0) return false;
        if (value.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        return (
            value.length >= 3 &&
            value.length <= 30 &&
            !value.includes(' ') &&
            !value.startsWith('.') &&
            !value.endsWith('.') &&
            usernamePattern.test(value)
        );
    }
    defaultMessage(): string {
        return 'Invalid username or email.';
    }
}

export class LoginDto {
    @Validate(IsUsernameOrEmail, { message: 'Invalid username or email.' })
    username!: string;

    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @MaxLength(30, { message: 'Password cannot exceed 30 characters long.' })
    password!: string;
}
