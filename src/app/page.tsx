"use client";

import { useState } from "react";
import { Message, continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { text } from "stream/consumers";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}{" "}
            {message.image && <img src={message.image} />}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation([
              ...conversation,
              { role: "user", content: input },
            ]);

            let textContent = "";

            for await (const delta of readStreamableValue(newMessage)) {
              if ("text" in delta) {
                textContent = `${textContent}${delta.text}`;

                setConversation([
                  ...messages,
                  { role: "assistant", content: textContent },
                ]);
              }
              if ("image" in delta) {
                setConversation([
                  ...messages,
                  {
                    role: "assistant",
                    content: textContent,
                    image: delta.image,
                  },
                ]);
              }
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
