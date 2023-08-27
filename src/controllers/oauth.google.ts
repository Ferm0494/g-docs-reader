import express from "express";
import { google } from "googleapis";
import { GoogleOAuth } from "../services/oauth/google/google.oauth.service";
import { PublisherService } from "../services/pub/publisher.service";
const app = express();

app.get("/", (_, res) => {
  res.writeHead(301, { Location: GoogleOAuth.generateAuthUrl() });
  res.end();
});

app.get("/callback", async (req, res) => {
  try {
    if (req.query.error || !req.query.code) {
      return res
        .status(401)
        .json({ error: req.query.error || "", status: 401 });
    }
    const authInstance = GoogleOAuth.getInstance();
    const { tokens } = await authInstance.getToken(req.query.code as string);
    if (tokens.access_token) {
      authInstance.setCredentials(tokens);
      const tokenData = await authInstance.getTokenInfo(tokens.access_token);
      const userSelectedAllScopes =
        tokenData.scopes.includes(GoogleOAuth.getAuthScopes()[0]) &&
        tokenData.scopes.includes(GoogleOAuth.getAuthScopes()[1]);

      if (userSelectedAllScopes) {
        const userInfo = await google
          .oauth2({ auth: authInstance, version: "v2" })
          .userinfo.get();
        await PublisherService.publishNewUser(JSON.stringify({email: userInfo.data.email, refreshToken: tokens.refresh_token, accessToken: tokens.access_token}));
        return res.json({message: 'OK', status: 200});
      } else {
        return res.status(401).json({ error: "Missing Scopes", status: 401 });
      }
    } else {
      return res.json(401).json({ error: "Missing access token", status: 401 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error || "Internal Error", status: 500 });
  }
});

export default app;
