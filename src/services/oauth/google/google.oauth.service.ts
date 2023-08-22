import { google } from "googleapis";
import { OAuth2Client, GenerateAuthUrlOpts } from "google-auth-library";
import { GoogleScopes } from "./scopes";

export class GoogleOAuth {
  private static Singleton: OAuth2Client;
  public static getInstance() {
    if (!GoogleOAuth.Singleton) {
      GoogleOAuth.Singleton = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.CALLBACK_URL
      );
    }
    return GoogleOAuth.Singleton;
  }
  static generateAuthUrl(options: GenerateAuthUrlOpts = {}) {
    return GoogleOAuth.getInstance().generateAuthUrl({
      access_type: "offline",
      scope: [GoogleScopes.DriveReadonly, GoogleScopes.UserInfoEmail],
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
        .oauth2({ auth: GoogleOAuth.getInstance(), version: "v2" })
        .userinfo.get()
    ).data;
    return userInfo;
  }
}