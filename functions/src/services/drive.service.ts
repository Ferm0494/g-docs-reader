import {GoogleApis, drive_v3} from "googleapis";
import {BaseService} from "./base.service";

export class DriverService extends BaseService {
  private static Singleton: drive_v3.Drive;
  static getInstance() {
    if (!DriverService.Singleton) {
      DriverService.Singleton = new GoogleApis().drive({version: "v3"});
    }
    return DriverService.Singleton;
  }
}
