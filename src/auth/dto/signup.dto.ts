import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Sesuraj', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}
