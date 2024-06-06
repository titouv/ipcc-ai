import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// Instantiate a new Pinecone client, which will automatically read the
// env vars: PINECONE_API_KEY and PINECONE_ENVIRONMENT which come from
// the Pinecone dashboard at https://app.pinecone.io

const pinecone = new Pinecone();

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex }
);

// /* Search the vector DB independently with metadata filters */
// const query = "what is the relation between earth temperature and C02";
// const results = await vectorStore.similaritySearchWithScore(query, 4);
// console.log(results);
/*
  [
    Document {
      pageContent: 'pinecone is a vector db',
      metadata: { foo: 'bar' }
    }
  ]
*/

export async function queryFigures(
  query: string,
  scoreThreshold = 0.5,
  numberOfResults = 1
) {
  const results = await vectorStore.similaritySearchWithScore(
    query,
    numberOfResults
  );
  console.log(results);
  return results
    .filter((result) => result[1] > scoreThreshold)
    .map((result) => result[0]);
}
