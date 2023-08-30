import {IsEmail, IsString, IsNotEmpty} from "class-validator";

export class CreateUserDto {
  @IsEmail()
    email?: string;
  @IsString()
  @IsNotEmpty()
    refreshToken?: string;
  constructor({email, refreshToken}: Partial<CreateUserDto>) {
    this.email = email;
    this.refreshToken = refreshToken;
  }
}
