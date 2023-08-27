import {GoogleApis, docs_v1} from "googleapis";
import {googleDocsToMarkdown} from "docs-markdown";
import {GaxiosResponse} from "gaxios";
import {logger} from "firebase-functions/v1";
import {BaseService} from "./base.service";
import {DriverService} from "./drive.service";

export class DocsService extends BaseService {
  private static Singleton: docs_v1.Docs;
  static getInstance() {
    if (!DocsService.Singleton) {
      DocsService.Singleton = new GoogleApis().docs({version: "v1"});
    }
    return DocsService.Singleton;
  }
  static async getDocs(accessToken: string):
  Promise<GaxiosResponse<docs_v1.Schema$Document>[]> {
    const files = (
      await DriverService.getInstance().files.list({
        access_token: accessToken,
      })
    ).data.files?.filter(
      (file) => file.mimeType === "application/vnd.google-apps.document"
    );
    logger.info("Files", {files});
    let docs: GaxiosResponse<docs_v1.Schema$Document>[] = [];
    if (files) {
      docs = await Promise.all(
        files
          .map((file) => {
            if (file.id) {
              return DocsService.getInstance().documents.get({
                documentId: file.id,
                access_token: accessToken,
              });
            } else {
              return null;
            }
          })
          .filter((doc) => !!doc) as Promise<
          GaxiosResponse<docs_v1.Schema$Document>
        >[]
      );
    } else {
      logger.warn("No files found");
    }
    return docs;
  }
  static transformDocToMarkdown(
    docs: GaxiosResponse<docs_v1.Schema$Document>[]
  ) {
    const transformedDocs = docs.map((doc) => {
      return {
        id: doc.data.documentId as string,
        markdown: googleDocsToMarkdown(doc.data),
      };
    });
    logger.info("Transformed docs", {docs: transformedDocs});
    return transformedDocs;
  }
}
