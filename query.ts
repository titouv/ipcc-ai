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

const CONFIDENCE_THRESHOLD = 0.8;

export async function queryFigure(query: string, numberOfResults = 1) {
  const results = await vectorStore.similaritySearchWithScore(
    query,
    numberOfResults,
    {
      type: {
        $eq: "figure",
      },
    }
  );
  console.log(results);
  const formattedResults = results
    .filter((result) => result[1] > CONFIDENCE_THRESHOLD)
    .map((result) => ({ ...result[0], confidence: result[1] }));

  if (formattedResults.length === 0) {
    return undefined;
  }
  const result = formattedResults[0];
  return result;
}
