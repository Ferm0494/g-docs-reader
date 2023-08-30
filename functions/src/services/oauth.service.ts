import {google} from "googleapis";
import {OAuth2Client, GenerateAuthUrlOpts} from "google-auth-library";
import {GoogleScopes} from "../contants/scopes";
import {BaseService} from "./base.service";

export class GoogleOAuth extends BaseService {
  private static Singleton: OAuth2Client;
  public static getInstance() {
    if (!GoogleOAuth.Singleton) {
      GoogleOAuth.Singleton = new google.auth.OAuth2(
        this.getConfig().CLIENT_ID,
        this.getConfig().CLIENT_SECRET,
        this.getConfig().CALLBACK_URL
      );
    }
    return GoogleOAuth.Singleton;
  }
  static generateAuthUrl(options: GenerateAuthUrlOpts = {}) {
    return GoogleOAuth.getInstance().generateAuthUrl({
      access_type: "offline",
      scope: this.getAuthScopes(),
      include_granted_scopes: true,
      ...options,
    });
  }

  static getAuthScopes() {
    return [GoogleScopes.DriveReadonly, GoogleScopes.UserInfoEmail];
  }

  static async getUserInfo() {
    const userInfo = (
      await google
        .oauth2({auth: GoogleOAuth.getInstance(), version: "v2"})
        .userinfo.get()
    ).data;
    return userInfo;
  }
}
