import {onRequest, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {google} from "googleapis";
import {CreateUserDto} from "./dtos/create-user.dto";
import {FirestoreService} from "./services/firestore.service";
import {GoogleOAuth} from "./services/oauth.service";
import {validateOrReject} from "class-validator";
import {SyncUserDto} from "./dtos/sync-user.dto";
import {DocsService} from "./services/docs.service";
import {CustomExceptions} from "./contants/custom-exceptions";
import {GetDocsDto} from "./dtos/get-docs.dto";

const newUser = async (newUser: CreateUserDto) => {
  const newUserDto = new CreateUserDto(newUser);
  await validateOrReject(newUserDto).catch((errors) => {
    throw new HttpsError("invalid-argument", CustomExceptions.INVALID_PAYLOAD, errors);
  });
  return FirestoreService.addUser(newUserDto as Required<CreateUserDto>);
};

export const sync = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
    }
    const syncDto = new SyncUserDto(req.body);
    await validateOrReject(syncDto).catch((errors) => {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_PAYLOAD, errors);
    });
    const snapshot = await FirestoreService.getDoc("users", [
      syncDto.userId,
      "accounts",
      syncDto.email,
    ]);
    const docData = snapshot.data();
    if (!docData?.refreshToken) {
      throw new HttpsError("not-found", CustomExceptions.NOT_FOUND);
    }
    const authInstance = GoogleOAuth.getInstance();
    authInstance.setCredentials({refresh_token: docData.refreshToken});
    const tokensResponse = await authInstance.getAccessToken();
    if (!tokensResponse.token) {
      throw new HttpsError("not-found", CustomExceptions.NOT_FOUND);
    }
    const doc = await DocsService.getInstance().documents.get({
      access_token: tokensResponse.token,
      documentId: syncDto.document,
    });
    await FirestoreService.addDocToUser(syncDto, DocsService.transformDocToMarkdown(doc));
    res.json({status: 200, message: "OK"});
  } catch (error) {
    logger.error("Error on sync", {error});
    res.send(error);
  }
});

export const oauth = onRequest(async (req, res) => {
  if (req.method !== "GET") {
    throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
  } else if (!req.query.userId) {
    throw new HttpsError("invalid-argument", CustomExceptions.INVALID_PAYLOAD);
  }
  res.writeHead(301, {
    Location: GoogleOAuth.generateAuthUrl({
      state: Buffer.from(JSON.stringify({userId: req.query.userId}), "utf-8").toString(
        "base64",
      ),
      prompt: "consent",
    }),
  });
  res.end();
});

export const oauthCallback = onRequest(async (req, res) => {
  try {
    if (req.method !== "GET") {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
    }
    if (req.query.error || !req.query.code || !req.query.state) {
      throw new HttpsError(
        "invalid-argument",
        req.query.error ? (req.query.error as string) : CustomExceptions.NOT_FOUND,
      );
    }
    const state = JSON.parse(Buffer.from(req.query.state as string, "base64").toString("utf-8"));
    logger.info("state", {state});
    if (!state?.userId) {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_PAYLOAD);
    }
    const authInstance = GoogleOAuth.getInstance();
    const {tokens} = await authInstance.getToken(req.query.code as string);
    if (!tokens.access_token) {
      throw new HttpsError("not-found", CustomExceptions.NOT_FOUND);
    }
    authInstance.setCredentials(tokens);
    const tokenData = await authInstance.getTokenInfo(tokens.access_token);
    const userSelectedAllScopes =
         tokenData.scopes.includes(GoogleOAuth.getAuthScopes()[0]) &&
         tokenData.scopes.includes(GoogleOAuth.getAuthScopes()[1]);
    if (!userSelectedAllScopes) {
      throw new HttpsError("permission-denied", CustomExceptions.PERMISSION_DENIED);
    }
    const userInfo = await google
      .oauth2({
        auth: authInstance,
        version: "v2",
      })
      .userinfo.get();
    logger.log("User Info", {userInfo});
    await newUser({
      userId: state.userId as string,
      email: userInfo.data.email || undefined,
      refreshToken: tokens.refresh_token || undefined,
    });
    // TODO: Refactor this.
    res.writeHead(301, {
      Location: `http://localhost:5173?email=${userInfo.data.email}`,
    });
    res.end();
  } catch (error) {
    logger.error("Error on oauth callback", {error});
    res.send(error);
  }
});

export const docs = onRequest(async (req, res) => {
  try {
    if (req.method !== "GET") {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
    }
    const getDocsDto = new GetDocsDto({
      userId: req.query.userId as string,
      account: req.query.account as string,
    });
    await validateOrReject(getDocsDto).catch((errors) => {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_PAYLOAD, errors);
    });
    const accountDocs = await FirestoreService.getUserAccountDocs(getDocsDto);
    res.send({docs: accountDocs});
  } catch (error) {
    logger.error("Error on get account docs", {error});
    res.send(error);
  }
});
