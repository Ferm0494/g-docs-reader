import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class SyncUserDto {
  @IsEmail()
    email: string;
  @IsNotEmpty()
  @IsString()
    document: string;

  @IsNotEmpty()
  @IsString()
    userId: string;
  constructor({email, document, userId}: SyncUserDto) {
    this.email = email;
    this.document = document;
    this.userId = userId;
  }
}
