import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { vectorStore } from "../../../../pinecone";
import { CustomRetriever } from "./retriever";

const systemTemplate = [
  `You are an assistant for question-answering tasks. `,
  `Use the following pieces of retrieved context to answer `,
  `the question. If you don't know the answer, say that you `,
  `don't know. Use three sentences maximum and keep the `,
  `answer concise.`,
  `\n\n`,
  `{context}`,
].join("");

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", "{input}"],
]);

const retriever = new CustomRetriever();

const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  verbose: true,
});

const questionAnswerChain = await createStuffDocumentsChain({ llm, prompt });
export const ragChain = await createRetrievalChain({
  retriever,
  combineDocsChain: questionAnswerChain,
});
