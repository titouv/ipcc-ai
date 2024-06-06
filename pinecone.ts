import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getGiecFigurePages } from "./ingest";

// Instantiate a new Pinecone client, which will automatically read the
// env vars: PINECONE_API_KEY and PINECONE_ENVIRONMENT which come from
// the Pinecone dashboard at https://app.pinecone.io

const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const figurePages = await getGiecFigurePages();

const docs = figurePages.map(
  (figurePage) =>
    new Document({
      pageContent: figurePage.caption,
      metadata: {
        title: figurePage.title,
        url: figurePage.url,
        image: figurePage.img,
      },
    })
);

await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
  pineconeIndex,
  maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
});

// pineconeIndex;
