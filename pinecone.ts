import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getGiecFigurePages } from "./ingest";

// Instantiate a new Pinecone client, which will automatically read the
// env vars: PINECONE_API_KEY and PINECONE_ENVIRONMENT which come from
// the Pinecone dashboard at https://app.pinecone.io

const pinecone = new Pinecone();

export const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

export const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex }
);

// const figurePages = await getGiecFigurePages();

// const docs = figurePages.map(
//   (figurePage) =>
//     new Document({
//       pageContent: figurePage.caption,
//       metadata: {
//         title: figurePage.title,
//         url: figurePage.url,
//         image: figurePage.img,
//       },
//     })
// );

// async function main() {
//   const allIds = (await pineconeIndex.listPaginated()).vectors?.map(
//     (v) => v.id
//   );
//   if (!allIds) {
//     throw new Error("No vectors found");
//   }
//   console.log(allIds.length);

//   const selectedIds = allIds as string[];

//   const result = await pineconeIndex.fetch(selectedIds);
//   const pdfs = Object.values(result.records).filter((v) => v.metadata?.source);
//   const pdfIds = pdfs.map((v) => v.id);

//   await pineconeIndex.deleteMany(pdfIds);
// }
// main();

// for (const id of allIds) {
//   pineconeIndex.update({
//     id: id!,
//     metadata: {
//       type: "figure",
//     },
//   });
// }
// index.update(
//   (id = "id-3"),
//   (set_metadata = { type: "web", new: True }),
//   (namespace = "ns1")
// );

// await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
//   pineconeIndex,
//   maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
// });

// pineconeIndex;
