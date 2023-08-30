import {GoogleApis, docs_v1} from "googleapis";
import {googleDocsToMarkdown} from "docs-markdown";
import {GaxiosResponse} from "gaxios";
import {BaseService} from "./base.service";

export class DocsService extends BaseService {
  private static Singleton: docs_v1.Docs;
  static getInstance() {
    if (!DocsService.Singleton) {
      DocsService.Singleton = new GoogleApis().docs({version: "v1"});
    }
    return DocsService.Singleton;
  }
  static transformDocToMarkdown(
    doc: GaxiosResponse<docs_v1.Schema$Document>
  ) {
    return {
      id: doc.data.documentId as string,
      markdown: googleDocsToMarkdown(doc.data),
    };
  }
}
