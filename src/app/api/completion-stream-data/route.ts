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

import { LangChainAdapter, StreamData, StreamingTextResponse } from "ai";
import { queryFigure } from "../../../../query";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { vectorStore } from "../../../../pinecone";
import { ragChain } from "./chain";

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
  const { messages: receivedMessages } = await req.json();
  // await sleep(1000 * 30);
  console.log(receivedMessages);
  const figure = await queryFigure(
    receivedMessages[receivedMessages.length - 1].content
  );
  const messages = [
    {
      role: "system",
      content: figure
        ? SYSTEM_PROMPT +
          "\n When a user ask a question you will have the description of the most link image as context, your answer must use this description to answer the question. You MUST mention the image"
        : SYSTEM_PROMPT,
    },
    ...receivedMessages,
  ];
  if (figure) {
    messages.push({
      role: "assistant",
      content: `Image description is the following\n\n:` + figure.pageContent,
    });
  }
  const model = new ChatGroq({
    model: "llama3-70b-8192",
    temperature: 0,
  });

  const formattedMessages = messages.map((message: any) => {
    if (message.role === "user") {
      return new HumanMessage(message.content);
    } else if (message.role === "system") {
      return new SystemMessage(message.content);
    } else {
      return new AIMessage(message.content);
    }
  });
  const stream = await ragChain.stream({
    question: messages[messages.length - 1].content,
    chat_history: formattedMessages,
  });
  // const stream = await model.stream(formattedMessages);
  const data = new StreamData();
  if (figure) {
    const promise = new Promise<void>(async (resolve) => {
      const externalData: ExternalDataType = {
        messageIndex: messages.length,
        content: figure.pageContent,
        title: figure.metadata.title,
        url: figure.metadata.url,
        image: figure.metadata.image,
        confidence: figure.confidence,
      };
      data.appendMessageAnnotation(externalData);
      resolve();
    });
    await promise;
  }

  const aiStream = LangChainAdapter.toAIStream(stream, {
    async onFinal() {
      data.close();
    },
  });

  return new StreamingTextResponse(aiStream, {}, data);
}
