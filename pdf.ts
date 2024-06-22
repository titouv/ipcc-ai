const pdfUrl =
  "https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_SPM.pdf";
// download pdf
import fs from "fs";

const pdf = await fetch(pdfUrl).then((res) => res.arrayBuffer());
const buffer = Buffer.from(pdf);
const file = fs.createWriteStream("ipcc-ar6-syr.pdf");
file.write(buffer);
file.end();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "./pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

const loader = new PDFLoader("ipcc-ar6-syr.pdf");

const docs = await loader.load();
console.log(docs.length);

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const splits = await textSplitter.splitDocuments(docs);
splits.forEach((split) => {
  split.metadata.type = "pdf";
});

await PineconeStore.fromDocuments(splits, new OpenAIEmbeddings(), {
  pineconeIndex,
  maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
});
