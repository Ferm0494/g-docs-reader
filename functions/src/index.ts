import {onMessagePublished} from "firebase-functions/v2/pubsub";
import {config, runWith} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {OAuth2Client} from "google-auth-library";
import {CreateUserDto} from "./dtos/create-user.dto";
import {validateOrReject} from "class-validator";
import {DocsService} from "./services/docs.service";
import {FirestoreService} from "./services/firestore.service";

const syncUsers = async ()=>{
  const users = await FirestoreService.getDocs("users");
  users.docs.forEach(async (user) => {
    const refreshToken = user.data().refreshToken;
    const oauth2Client = new OAuth2Client({
      clientId: config().CLIENT_ID,
      clientSecret: config().CLIENT_SECRET,
    });
    oauth2Client.setCredentials({refresh_token: refreshToken});
    oauth2Client
      .getAccessToken()
      .then(async (tokenResponse) => {
        if (tokenResponse.token) {
          const docs = await DocsService.getDocs(tokenResponse.token);
          await FirestoreService.updateUserDocs({
            email: user.id,
            docs:
                docs.length > 0 ?
                  DocsService.transformDocToMarkdown(docs) :
                  undefined,
          });
        } else {
          throw Error(`No token in response for user: ${user.id}`);
        }
      })
      .catch((error) => {
        logger.warn("Error on getting user access token", {
          error,
          user: user.id,
        });
      });
  });
};

export const newUser = onMessagePublished(
  config().NEW_USER_TOPIC,
  async (event) => {
    try {
      logger.info("Event", {event: event.data.message.json});
      const payload = event.data.message.json;
      const user = new CreateUserDto(payload);
      await validateOrReject(user);
      const {refreshToken, email, accessToken} = user;
      const docs = await DocsService.getDocs(accessToken);
      await FirestoreService.addUser({
        refreshToken,
        email,
        docs:
          docs.length > 0 ?
            DocsService.transformDocToMarkdown(docs) :
            undefined,
      });
    } catch (error) {
      logger.error({error}, "Error occured");
    }
  }
);

export const syncUserAuto = runWith({memory: "4GB"})
  .pubsub.schedule("* * * * *")
  .onRun(async (event) => {
    logger.log("Event", {event: event});
    await syncUsers();
  });

export const syncUserManual = runWith({memory: "4GB"}).https.onRequest(
  async (_, res) => {
    await syncUsers();
    res.send("OK");
  }
);
