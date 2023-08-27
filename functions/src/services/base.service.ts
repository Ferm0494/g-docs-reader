import {config} from "firebase-functions";

interface EnvironmentVars {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  PROJECT_ID: string;
  NEW_USER_TOPIC: string;
  NODE_ENV: "production" | "development";
  HOST: string;
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
      "NEW_USER_TOPIC",
      "NODE_ENV",
      "HOST",
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
