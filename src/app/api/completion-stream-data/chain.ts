import { ChatGroq } from "@langchain/groq";
import { pull } from "langchain/hub";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import {
  RunnableLike,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { vectorStore } from "../../../../pinecone";
import { DocumentInterface } from "@langchain/core/documents";
import { contextualizeQChain } from "./contextualize-qchain";

// const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  // verbose: true,
});

const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
  If you don't know the answer, just say that you don't know.
  Use fivesentences maximum and keep the answer concise.
  
  {context}`;

const qaPrompt = ChatPromptTemplate.fromMessages([
  ["system", qaSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "QA:{question}"],
]);

const contextualizedQuestion = (input: Record<string, any>) => {
  if ("chat_history" in input && input.chat_history.length > 0) {
    console.log("RUNNING CHAT HISTORY");
    return contextualizeQChain;
  }
  console.log("RUNNING QUESTION");
  return input.question;
};

const retriever = vectorStore.asRetriever({
  metadata: {
    type: "pdf",
  },
  k: 1, // TODO: change to 5
});

export const ragChain2 = RunnableSequence.from([
  RunnablePassthrough.assign({
    context: (input: Record<string, any>) => {
      const chain = contextualizedQuestion(input);
      const retrieverAs = retriever as RunnableLike<
        string,
        DocumentInterface<Record<string, any>>[]
      >;
      function formatDocumentsAsStringWrapper(
        documents: DocumentInterface<Record<string, any>>[]
      ) {
        console.log(
          "documents",
          documents.map((doc) => doc.pageContent).join("\n\n\n\n\n")
        );
        return formatDocumentsAsString(documents);
      }
      const value = chain
        .pipe(retrieverAs)
        .pipe(formatDocumentsAsStringWrapper);
      return value;
    },
  }),
  qaPrompt,
  llm,
]);
