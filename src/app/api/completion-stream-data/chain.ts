import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { pull } from "langchain/hub";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
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

const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

// const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
});

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
  which can be understood without the chat history. Do NOT answer the question,
  just reformulate it if needed and otherwise return it as is.`;

const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
  ["system", contextualizeQSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const contextualizeQChain = contextualizeQPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());

const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
  If you don't know the answer, just say that you don't know.
  Use fivesentences maximum and keep the answer concise.
  
  {context}`;

const qaPrompt = ChatPromptTemplate.fromMessages([
  ["system", qaSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const contextualizedQuestion = (input: Record<string, unknown>) => {
  console.log("input.question", input.question);
  return contextualizeQChain;
};

const retriever = vectorStore.asRetriever({
  metadata: {
    type: "pdf",
  },
});

export const ragChain = RunnableSequence.from([
  RunnablePassthrough.assign({
    context: (input: Record<string, unknown>) => {
      if ("chat_history" in input) {
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
      }
      return "";
    },
  }),
  qaPrompt,
  llm,
]);
