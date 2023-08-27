import express from "express";
import "dotenv/config";
import OAuthGoogleRouter from "./controllers/oauth.google";
import { BaseService } from "./services/base";

const app = express();
const port = BaseService.getConfig().PORT

app.use("/oauth/google", OAuthGoogleRouter);
app.listen(port, () => {
  console.log(`Server is running in port: ${port}`);
});
