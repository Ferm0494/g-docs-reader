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


const newUser = async (newUser: CreateUserDto) => {
  const newUserDto = new CreateUserDto(newUser);
  await validateOrReject(newUserDto).catch((errors)=> {
    throw new HttpsError("invalid-argument",
      CustomExceptions.INVALID_PAYLOAD, errors);
  });
  return FirestoreService.addUser(newUserDto as Required<CreateUserDto>);
};

export const sync = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
    }
    const sycnDto = new SyncUserDto(req.body);
    await validateOrReject(sycnDto).catch((errors)=> {
      throw new HttpsError("invalid-argument",
        CustomExceptions.INVALID_PAYLOAD, errors);
    });
    const snapshot = await FirestoreService.getDoc("users", sycnDto.email);
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
      documentId: sycnDto.document,
    });
    await FirestoreService.addDocToUser(
      sycnDto.email,
      DocsService.transformDocToMarkdown(doc)
    );
    res.json({status: 200, message: "OK"});
  } catch (error) {
    logger.error("Error on sync", {error});
    res.send(error);
  }
});

export const oauth = onRequest(async (req, res) => {
  if (req.method !== "GET") {
    throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
  }
  res.writeHead(301, {Location: GoogleOAuth.generateAuthUrl()});
  res.end();
});

export const oauthCallback = onRequest(async (req, res) => {
  try {
    if (req.method !== "GET") {
      throw new HttpsError("invalid-argument", CustomExceptions.INVALID_METHOD);
    }
    if (req.query.error || !req.query.code) {
      throw new HttpsError(
        "invalid-argument",
        req.query.error ? (req.query.error as string) :
          CustomExceptions.NOT_FOUND
      );
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
      throw new HttpsError("permission-denied",
        CustomExceptions.PERMISSION_DENIED);
    }
    const userInfo = await google
      .oauth2({
        auth: authInstance,
        version: "v2",
      })
      .userinfo.get();
    logger.log("User Info", {userInfo});
    await newUser({
      email: userInfo.data.email || undefined,
      refreshToken: tokens.refresh_token || undefined,
    });
    res.json({message: "OK", status: 200});
  } catch (error) {
    logger.error("Error on oauth callback", {error});
    res.send(error);
  }
});
