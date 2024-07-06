"use client";
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

// import { Message } from "ai";
import {
  ArrowUp,
  Bird,
  LandmarkIcon,
  MessageCircle,
  Shrub,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { readStreamableValue } from "ai/rsc";
import { useChat } from "ai/react";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { AnimatePresence, m, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ExternalDataType } from "./api/completion-stream-data/route";
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
        className="bg-transparent border-none focus:outline-none resize-none h-[40px] w-full pl-3"
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
  let {
    input,
    handleInputChange,
    append,
    handleSubmit,
    error,
    isLoading,
    messages,
  } = useChat({
    api: "/api/completion-stream-data",
  });
  const t = useI18n();

  //   const [messages, setMessages] = useState<Message[]>([]);
  // V
  //   function toggleMessage() {
  //     if (messages.length === 0) {
  //       setMessages(demoMessages);
  //     } else {
  //       setMessages([]);
  //     }
  //   }

  const lastMessageAnnotation = messages[messages.length - 1]?.annotations;

  const { showTopShadow, showBottomShadow, scrollContainerRef, handleScroll } =
    useScrollShadow();

  const controlsTop = useAnimation();
  const controlsBottom = useAnimation();

  useEffect(() => {
    controlsTop.start({ opacity: showTopShadow ? 1 : 0 });
  }, [showTopShadow, controlsTop]);

  useEffect(() => {
    controlsBottom.start({ opacity: showBottomShadow ? 1 : 0 });
  }, [showBottomShadow, controlsBottom]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen font-sans relative">
      {/* <div className="absolute bg-gradient-to-t from-[#7FCBF5]/40 to-[#7FCBF5]/0 bottom-0  left-0 right-0 h-20 -z-10"></div> */}
      <motion.div
        initial="show"
        animate={messages.length == 0 ? "show" : "hide"}
        variants={{
          show: { top: "auto" },
          hide: { top: "2rem" },
        }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "absolute",
          zIndex: "10",
          // backgroundColor: "red",
        }}
      >
        <motion.div
          // onClick={toggleMessage}
          animate={messages.length == 0 ? "show" : "hide"}
          variants={{
            show: { scale: 1 },
            hide: { scale: 0.5 },
          }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-8 relative"
        >
          <motion.img
            src="/ipcc-ai.png"
            className="w-[72px] h-[72px] animate-custom-spin z-50"
          />
          <div className="font-outfit text-5xl font-bold text-[#052F4D] z-50">
            <span>{t("ipcc")}</span> <span>AI</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {messages.length == 0 && (
            <motion.div
              // from opacity 0 to 100 in 1.5 seconds
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-8 flex-col"
            >
              <ChatComponent append={append} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        //appears in 1.5 seconds
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex items-center justify-start w-full gap-8 flex-col mt-32 relative overflow-y-auto"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="w-full max-w-2xl">
          <div className="max-w-2xl w-full">
            {/* <pre>{JSON.stringify(lastMessageAnnotation, null, 2)}</pre> */}
            <ChatMessages messages={messages} isLoading={isLoading} />
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white z-100 to-white/0 mt-32 pointer-events-none touch-none"
        initial={{ opacity: 0 }}
        animate={controlsTop}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white z-100 mb-24 to-white/0 pointer-events-none touch-none"
        initial={{ opacity: 0 }}
        animate={controlsBottom}
        transition={{ duration: 0.2 }}
      />
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

import showdown from "showdown";
import { useCurrentLocale, useI18n, useScopedI18n } from "@/locales/client";
import { ScrollableContent } from "./test/page";
import useScrollShadow from "@/hooks/test";

function ChatMessages(props: { messages: Message[]; isLoading: boolean }) {
  // side by side messages
  const lastMessageRole = props.messages[props.messages.length - 1]?.role;
  return (
    <div className="flex flex-col gap-10 w-full pb-20 relative">
      {props.messages.map((message, index) => {
        const annotations = message.annotations as
          | ExternalDataType[]
          | undefined;
        const image = annotations?.[0]?.image;
        // convert to markdown using showdown
        const converter = new showdown.Converter();
        const markdown = converter.makeHtml(message.content);
        return (
          <div key={index} className="flex items-center gap-4 w-full">
            {message.role === "user" ? (
              <div className="flex flex-row-reverse items-center gap-2 w-full">
                <div className="flex flex-col gap-2 max-w-[400px] bg-zinc-100  p-2 rounded-lg">
                  <div className="text-[15px] ">{message.content}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 w-full">
                <img
                  src="/ipcc-ai.png"
                  key="loading-spinner"
                  className={cn(
                    "w-[30px] h-[30px]",
                    props.isLoading && "animate-spin"
                  )}
                />
                <div className="flex flex-col gap-2 w-full">
                  {image && (
                    <img
                      src={image}
                      className="border-2 border-zinc-100  rounded-md p-2  mt-2"
                    />
                  )}
                  <div
                    className="text-[15px] prose prose-sm prose-strong:before:bg-blue-500"
                    dangerouslySetInnerHTML={{ __html: markdown }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      {props.isLoading && lastMessageRole == "user" && (
        <div className="flex items-center gap-4 w-full">
          <img
            key="loading-spinner"
            src="/ipcc-ai.png"
            className={cn(
              "w-[30px] h-[30px]",
              props.isLoading && "animate-spin"
            )}
          />
          <div className="flex flex-col gap-2 w-full animate-pulse ">
            <div className="text-[15px] ">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
}
function ChatComponent(props: {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => Promise<string | null | undefined>;
}) {
  const locale = useCurrentLocale();
  const recommandations = [
    {
      titleEn: "Why is the earth temperature rising?",
      titleFr: "Pourquoi la température de la terre augmente-t-elle?",
      icon: ThermometerSun,
    },
    {
      titleEn: "What are some natural causes of climate change?",
      titleFr: "Quelles sont les causes naturelles du changement climatique?",
      icon: Shrub,
    },
    {
      titleEn: "How does climate change affect biodiversity?",
      titleFr: "Comment le changement climatique affecte-t-il la biodiversité?",
      icon: Bird,
    },
    {
      titleEn: "What's the role of government in climate change?",
      titleFr:
        "Quel est le rôle du gouvernement dans le changement climatique?",
      icon: LandmarkIcon,
    },
  ];

  return (
    <div className="mx-3 mt-12 flex max-w-3xl flex-wrap items-stretch justify-center gap-4">
      <div className="flex max-w-3xl flex-wrap items-stretch justify-center gap-4">
        {recommandations.map((recommendation, index) => (
          <button
            key={index}
            onClick={() =>
              props.append({
                role: "user",
                content:
                  locale === "en"
                    ? recommendation.titleEn
                    : recommendation.titleFr,
              })
            }
            className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary"
          >
            {recommendation.icon && (
              <recommendation.icon className="w-[20px] h-[20px]" />
            )}
            <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
              {locale === "en"
                ? recommendation.titleEn
                : recommendation.titleFr}
            </div>
          </button>
        ))}
        {/* <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <MessageCircle />
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            Email for plumber quote
          </div>
        </button>
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <MessageCircle />
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            What to do with kids' art
          </div>
        </button>
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <MessageCircle />
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            Explain nostalgia to a kindergartener
          </div>
        </button>
        <button className="relative flex w-40 flex-col gap-2 rounded-2xl border border-token-border-light px-3 pb-4 pt-3 text-start align-top text-[15px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition hover:bg-token-main-surface-secondary">
          <MessageCircle />
          <div className="line-clamp-3 text-balance text-gray-600 dark:text-gray-500 break-word">
            Python script for daily email reports
          </div>
        </button> */}
      </div>
    </div>
  );
}
