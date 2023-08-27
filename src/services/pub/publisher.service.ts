import { PubSub } from "@google-cloud/pubsub";
import { BaseService } from "../base";
export class PublisherService extends BaseService {
  private static Singleton: PubSub;
  public static getInstance() {
    if (!PublisherService.Singleton) {
      PublisherService.Singleton = new PubSub({
        projectId: process.env.PROJECT_ID,
        apiEndpoint: this.isNotProduction ? this.getConfig().PUB_HOST : undefined,
      });
    }
    return PublisherService.Singleton;
  }
  static async publishNewUser(data: string) {
    try {
      const dataBuffer = Buffer.from(data);
      const [topic] = await PublisherService.getInstance()
        .topic(this.getConfig().NEW_USER_TOPIC)
        .get({ autoCreate: true });
      const messageId = await topic.publishMessage({ data: dataBuffer });
      console.info(`Message ${messageId} published.`);
    } catch (error) {
      console.error(error);
    }
  }
}
