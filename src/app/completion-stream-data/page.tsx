"use client";

import { useChat, useCompletion } from "ai/react";
import { ExternalDataType } from "../api/completion-stream-data/route";

export default function Completion() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: "/api/completion-stream-data",
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h4 className="pb-4 text-xl font-bold text-gray-900 md:text-xl">
        useCompletion Example
      </h4>
      {messages.map((m, i) => {
        const annotations = m.annotations as ExternalDataType[] | undefined;
        const image = annotations ? annotations[0] : null;
        return (
          <div key={m.id}>
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
            {image && (
              <img className="border-2 rounded-xl p-2 my-2" src={image.image} />
            )}
            {/* <pre>{JSON.stringify(m, null, 2)}</pre> */}
          </div>
        );
      })}

      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <input
          className="w-full p-2 border-2 rounded-xl"
          value={input}
          placeholder=""
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
