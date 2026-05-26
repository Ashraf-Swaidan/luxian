// Data Transfer Object (DTO) for user registration
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength , IsOptional} from "class-validator";

export class RegisterDto {
    @IsEmail({}, {message: "Provide a valid email"})
    @IsNotEmpty({message: "Email is required"})
    email: string;

    @IsString()
    @IsNotEmpty({message:"Password is required"})
    @MinLength(8, {message: 'Password must at least be 8 characters long'})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'})
    password: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;
}