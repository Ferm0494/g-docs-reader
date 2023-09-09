import {config} from "firebase-functions";

interface EnvironmentVars {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  PROJECT_ID: string;
  NEW_USER_TOPIC: string;
  NODE_ENV: "production" | "development";
  CALLBACK_URL: string;
  HOST: string;
  FE_HOST: string;
}

export class BaseService {
  static get isNotProduction() {
    return this.getConfig().NODE_ENV !== "production";
  }
  static getConfig(): EnvironmentVars {
    const keys = [
      "CLIENT_ID",
      "CLIENT_SECRET",
      "PROJECT_ID",
      "NODE_ENV",
      "HOST",
      "CALLBACK_URL",
      "FE_HOST",
    ];
    const configObj = config();
    const hasAllKeys = keys.every((key) => configObj[key]);
    if (!hasAllKeys) {
      throw new Error(
        `Missing ENV vars: ${keys.filter((key) => !configObj[key]).join(", ")}`
      );
    }
    return configObj as EnvironmentVars;
  }
}
