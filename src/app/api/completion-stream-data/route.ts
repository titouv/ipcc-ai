import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter, StreamData, StreamingTextResponse } from "ai";
import { queryFigures } from "../../../../query";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

export type ExternalDataType = {
  messageIndex: number;
  content: string;
  image: string;
  title: string;
  url: string;
};
export async function POST(req: Request) {
  const { messages: receivedMessages } = await req.json();
  const figures = await queryFigures(
    receivedMessages[receivedMessages.length - 1].content
  );

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant from the IPCC that answers questions about the IPCC reports. When a user ask a question you will have the description of the most link image as context, your answer must use this description to answer the question. You MUST mention the image",
    },
    ...receivedMessages,
    {
      role: "assistant",
      content:
        `Image description is the following\n\n:` + figures[0].pageContent,
    },
  ];

  const model = new ChatOpenAI({
    model: "gpt-3.5-turbo-0125",
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
  console.log(formattedMessages);

  const stream = await model.stream(formattedMessages);
  const data = new StreamData();

  const promise = new Promise<void>(async (resolve) => {
    for (const figure of figures) {
      const externalData: ExternalDataType = {
        messageIndex: messages.length,
        content: figure.pageContent,
        title: figure.metadata.title,
        url: figure.metadata.url,
        image: figure.metadata.image,
      };
      data.appendMessageAnnotation(externalData);
    }
    resolve();
  });

  const aiStream = LangChainAdapter.toAIStream(stream, {
    async onFinal() {
      await promise;
      data.close();
    },
  });

  return new StreamingTextResponse(aiStream, {}, data);
}
