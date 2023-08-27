import {IsString, IsNotEmpty} from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
    email: string;
  @IsString()
  @IsNotEmpty()
    accessToken: string;
  @IsString()
  @IsNotEmpty()
    refreshToken: string;
  constructor({email, accessToken, refreshToken}: CreateUserDto) {
    this.email = email;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
