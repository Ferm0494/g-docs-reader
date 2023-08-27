interface EnvironmentVars {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  PROJECT_ID: string;
  NEW_USER_TOPIC: string;
  NODE_ENV: "production" | "development";
  PUB_HOST: string;
  PORT: number;
  CALLBACK_URL: string;
}

export class BaseService {
  static get isNotProduction() {
    return this.getConfig().NODE_ENV !== "production";
  }
  static getConfig(): EnvironmentVars {
    const keys = [
      "CLIENT_ID",
      "CALLBACK_URL",
      "PORT",
      "CLIENT_SECRET",
      "PROJECT_ID",
      "NEW_USER_TOPIC",
      "PUB_HOST",
      "NODE_ENV",
    ];
    const configObj = process.env;
    const hasAllKeys = keys.every((key) => configObj[key]);
    if (!hasAllKeys)
      throw new Error(
        `Missing ENV vars: ${keys.filter((key) => !configObj[key]).join(", ")}`
      );
    return {
      CLIENT_ID: configObj.CLIENT_ID as string,
      CLIENT_SECRET: configObj.CLIENT_SECRET as string,
      PROJECT_ID: configObj.PROJECT_ID as string,
      NEW_USER_TOPIC: configObj.NEW_USER_TOPIC as string,
      NODE_ENV: configObj.NODE_ENV as "production" | "development",
      PUB_HOST: configObj.PUB_HOST as string,
      PORT: Number(configObj.PORT),
      CALLBACK_URL: configObj.CALLBACK_URL as string,
    };
  }
}
