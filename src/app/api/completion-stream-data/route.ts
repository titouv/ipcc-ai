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
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
const cb1 = literalClient.instrumentation.langchain.literalCallback();

import {
  AIStream,
  LangChainAdapter,
  StreamData,
  StreamingTextResponse,
  createStreamDataTransformer,
} from "ai";
import { queryFigure } from "../../../../query";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  AIMessageChunk,
} from "@langchain/core/messages";
import { vectorStore } from "../../../../pinecone";
import { ragChain } from "./new";
import { getCurrentLocale } from "@/locales/server";
import { literalClient } from "@/lib/literalai";

export type ExternalDataType = {
  messageIndex: number;
  content: string;
  image: string;
  title: string;
  url: string;
  confidence: number;
};

const SYSTEM_PROMPT = `
You are an AI assistant specialized in climate science, specifically based on IPCC reports. Answer users' questions accurately and clearly, using information from these reports. Do not answer questions outside this topic.
Guidelines:
	1.	Accuracy: Ensure all responses are based on the information from IPCC reports.
	2.	Clarity: Explain complex scientific terms in a way that is understandable to a general audience.
	3.	Neutrality: Maintain a neutral tone and present information objectively.
	4.	Conciseness: Be concise but thorough in your explanations.
  5.  Use list and bold to make it more readable.
  5.  The response must be in less than 100 words.
`.trim();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  const locale = getCurrentLocale();
  console.log("locale", locale);

  const { messages: receivedMessages } = await req.json();
  // await sleep(1000 * 30);
  console.log(receivedMessages);

  const model = new ChatGroq({
    model: "llama3-70b-8192",
    temperature: 0,
  });

  const lastMessageContent: string =
    receivedMessages[receivedMessages.length - 1].content;
  const messages = [...receivedMessages];

  const formattedMessages = messages.map((message: any) => {
    if (message.role === "user") {
      return new HumanMessage(message.content);
    } else if (message.role === "system") {
      return new SystemMessage(message.content);
    } else {
      return new AIMessage(message.content);
    }
  });

  // console.log(res);
  // throw new Error("stop");

  const stream = await ragChain.stream(
    {
      input: lastMessageContent,
      chat_history: formattedMessages.slice(0, messages.length - 1),
    },
    {
      callbacks: [cb1],
    }
  );
  console.log(stream);

  function transformStreamToTextOnly(
    inputStream: typeof stream
  ): ReadableStream<AIMessageChunk> {
    return inputStream.pipeThrough(
      new TransformStream<{ answer: string }, AIMessageChunk>({
        transform(chunk, controller) {
          if ("answer" in chunk) {
            controller.enqueue(new AIMessageChunk({ content: chunk.answer }));
          } else {
            console.log("skipping chunk", chunk);
          }
        },
      })
    );
  }

  console.log("befor new stream");
  const newStream: ReadableStream<AIMessageChunk> =
    transformStreamToTextOnly(stream);

  const data = new StreamData();
  const aiStream = LangChainAdapter.toAIStream(newStream, {
    async onFinal(completion) {
      const generatedRecommendations = ["Why is the earth temprature rising?"];

      //sleep
      // await new Promise((resolve) => setTimeout(resolve, 1000 * 5));

      data.appendMessageAnnotation({
        generatedRecommendations,
      });

      data.close();
    },
  });
  console.log("after ai stream");

  return new StreamingTextResponse(aiStream, {}, data);
}
