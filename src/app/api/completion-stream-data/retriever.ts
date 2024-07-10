import {
  BaseRetriever,
  type BaseRetrieverInput,
} from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import { Document } from "@langchain/core/documents";
import { vectorStore } from "../../../../pinecone";

const retrieverPdf = vectorStore.asRetriever({
  metadata: {
    type: "pdf",
  },
  k: 1, // TODO: change to 5
});
const retrieverFigure = vectorStore.asRetriever({
  metadata: {
    type: "figure",
  },
  k: 1, // TODO: change to 5
});

export interface CustomRetrieverInput extends BaseRetrieverInput {}

export class CustomRetriever extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers"];

  constructor(fields?: CustomRetrieverInput) {
    super(fields);
  }

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    const figureDocs = await retrieverFigure._getRelevantDocuments(
      query,
      runManager
    );
    if (figureDocs.length > 0) {
      console.log("figure docs", figureDocs);
      return figureDocs;
    }
    const pdfDocs = await retrieverPdf._getRelevantDocuments(query, runManager);
    if (pdfDocs.length > 0) {
      console.log("pdf docs", pdfDocs);
      return pdfDocs;
    }
    return [];
  }
}
