"use client";
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

// import { Message } from "ai";
import { ArrowUp, MessageCircle } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { readStreamableValue } from "ai/rsc";
import { useChat } from "ai/react";
import { ChatRequestOptions, Message } from "ai";

const demoMessages: Message[] = [
  {
    content: "Hello",
    role: "user",
    id: "1",
  },
  {
    content: "How are you?",
    role: "assistant",
    id: "2",
  },
];

function ChatInput(props: {
  input: string;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        props.handleSubmit(e);
      }}
      className=" rounded-full  px-2 py-2  mb-8 bg-[#f4f4f4] border-none font-normal focus:outline-none  flex items-center gap-2 w-full"
    >
      <input
        placeholder="Type your message here"
        className="bg-transparent border-none focus:outline-none resize-none h-[40px] w-full pl-2"
        value={props.input}
        onChange={props.handleInputChange}
      />
      <button className="bg-white p-2 rounded-full " type="submit">
        <ArrowUp />
      </button>
    </form>
  );
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: "/api/completion-stream-data",
  });

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen font-sans">
        <div className=" flex-1 w-full flex items-center justify-center flex-col ">
          <div className="flex items-center justify-center gap-8 ">
            <img
              src="/ipcc-ai.png"
              className="w-[72px] h-[72px] animate-custom-spin"
            />
            <div className="font-outfit text-5xl font-bold text-[#052F4D]">
              <span>IPCC</span> <span>AI</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-8 flex-col">
            <ChatComponent />
          </div>
        </div>
        <div className="h-[100px] max-w-2xl w-full">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen font-sans">
      <div className="w-full flex items-center justify-center flex-col pt-16">
        <div className="flex items-center justify-center gap-8 ">
          <img
            src="/ipcc-ai.png"
            className="w-[72px] h-[72px] animate-custom-spin"
          />
          <div className="font-outfit text-5xl font-bold text-[#052F4D]">
            <span>IPCC</span> <span>AI</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-start w-full gap-8 flex-col pt-16">
        <div className="w-full max-w-2xl">
          <div className="max-w-2xl w-full">
            <ChatMessages messages={messages} />
          </div>
        </div>
      </div>
      <div className="h-[100px] max-w-2xl w-full">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

function ChatMessages({ messages }: { messages: Message[] }) {
  // side by side messages
  return (
    <div className="flex flex-col gap-10 w-full">
      {messages.map((message, index) => (
        <div key={index} className="flex items-center gap-4 w-full">
          {message.role === "user" ? (
            <div className="flex flex-row-reverse items-center gap-2 w-full">
              <div className="flex flex-col gap-2 max-w-[400px] bg-zinc-100  p-2 rounded-lg">
                <div className="text-[15px] ">{message.content}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 w-full">
              <img src="/ipcc-ai.png" className="w-[20px] h-[20px]" />
              <div className="flex flex-col gap-2 w-full ">
                <div className="text-[15px] ">{message.content}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
function ChatComponent() {
  return (
    <div className="mx-3 mt-12 flex max-w-3xl flex-wrap items-stretch justify-center gap-4">
      <div className="flex max-w-3xl flex-wrap items-stretch justify-center gap-4">
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="icon-md"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="M3 6h7M3 10h4"
            ></path>
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.428 17.572 20.5 10.5a2.828 2.828 0 1 0-4-4l-7.072 7.072a2 2 0 0 0-.547 1.022L8 19l4.406-.881a2 2 0 0 0 1.022-.547"
            ></path>
          </svg>
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            Email for plumber quote
          </div>
        </button>
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="icon-md"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19a3 3 0 1 1-6 0M15.865 16A7.54 7.54 0 0 0 19.5 9.538C19.5 5.375 16.142 2 12 2S4.5 5.375 4.5 9.538A7.54 7.54 0 0 0 8.135 16m7.73 0h-7.73m7.73 0v3h-7.73v-3"
            ></path>
          </svg>
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            What to do with kids' art
          </div>
        </button>
      </div>
      <div className="flex max-w-3xl flex-wrap items-stretch justify-center gap-4">
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="icon-md"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M12.455 4.105a1 1 0 0 0-.91 0L1.987 8.982 1.077 7.2l9.56-4.877a3 3 0 0 1 2.726 0l9.56 4.877A1.98 1.98 0 0 1 24 9.22V15a1 1 0 1 1-2 0v-3.784l-2.033.995v4.094a3 3 0 0 1-1.578 2.642l-4.967 2.673a3 3 0 0 1-2.844 0l-4.967-2.673a3 3 0 0 1-1.578-2.642v-4.094l-2.927-1.433C-.374 10.053-.39 7.949 1.077 7.2l.91 1.782 9.573 4.689a1 1 0 0 0 .88 0L22 8.989v-.014zM6.033 13.19v3.114a1 1 0 0 0 .526.88l4.967 2.674a1 1 0 0 0 .948 0l4.967-2.673a1 1 0 0 0 .526-.88V13.19l-4.647 2.276a3 3 0 0 1-2.64 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            Explain nostalgia to a kindergartener
          </div>
        </button>
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="icon-md"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm3-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm1.293 4.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414L8.586 12l-1.293-1.293a1 1 0 0 1 0-1.414M12 14a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1"
              clip-rule="evenodd"
            ></path>
          </svg>
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            Python script for daily email reports
          </div>
        </button>
      </div>
    </div>
  );
}
