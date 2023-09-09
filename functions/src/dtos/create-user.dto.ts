import {IsEmail, IsString, IsNotEmpty} from "class-validator";

export class CreateUserDto {
  @IsEmail()
    email?: string;
  @IsString()
  @IsNotEmpty()
    refreshToken?: string;
  @IsString()
  @IsNotEmpty()
    userId?: string;
  constructor({email, refreshToken, userId}: Partial<CreateUserDto>) {
    this.email = email;
    this.refreshToken = refreshToken;
    this.userId = userId;
  }
}
