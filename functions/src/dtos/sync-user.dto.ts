import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class SyncUserDto {
  @IsEmail()
    email: string;
  @IsNotEmpty()
  @IsString()
    document: string;

  constructor({email, document}: SyncUserDto) {
    this.email = email;
    this.document = document;
  }
}
