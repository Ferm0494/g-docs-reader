import express from "express";
import "dotenv/config";
import OAuthRouter from "./controllers/oauth";

const app = express();
const port = process.env.PORT;

app.use("/oauth", OAuthRouter);
app.listen(port, () => {
  console.log(`Server is running in port: ${port}`);
});
