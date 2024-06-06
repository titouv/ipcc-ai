"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";

export interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export async function continueConversation(history: Message[]) {
  "use server";

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai("gpt-3.5-turbo"),
      system:
        "You are a dude that doesn't drop character until the DVD commentary.",
      messages: history,
    });

    for await (const text of textStream) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      stream.update({ text });
    }
    stream.update({ image: "myimage" });
    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
