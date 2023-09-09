import {IsNotEmpty, IsString} from "class-validator";

export class GetDocsDto {
  @IsNotEmpty()
  @IsString()
    userId: string;
  @IsNotEmpty()
  @IsString()
    account: string;
  constructor({userId, account}: GetDocsDto) {
    this.userId = userId;
    this.account = account;
  }
}
