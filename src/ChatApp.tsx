import React from "react";
import { makeStyles, mergeClasses, shorthands } from "@griffel/react";
import { IMessage } from "./types";
import loadingIcon from './logo.svg';
import axios from "axios";
import { getPrompt } from "./openaiAPI";

const useStyles = makeStyles({
  root: {
    boxSizing: "border-box",
    ...shorthands.padding("16px"),
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  messageList: {
    flexGrow: 1,
    overflowY: "auto"
  },
  userMessageWrapper: {
    display: "flex",
    justifyContent: "flex-end"
  },
  userMessage: {
    color: "#fff",
    backgroundColor: "rgb(145, 72, 135)",
    ...shorthands.padding("8px", "16px"),
    width: "fit-content",
    maxWidth: "40%",
    ...shorthands.borderRadius("8px"),
    marginBottom: "16px"
  },
  botMessageWrapper: {
    display: "flex",
    justifyContent: "flex-start"
  },
  botMessage: {
    color: "#fff",
    backgroundColor: "#0f6cbd",
    ...shorthands.padding("8px", "16px"),
    width: "fit-content",
    maxWidth: "40%",
    minWidth: "320px",
    ...shorthands.borderRadius("8px"),
    marginBottom: "16px"
  },
  textareaWrapper: {
    position: "relative",
    height: "120px",
    display: "flex",
    alignItems: "center",
    columnGap: "16px"
  },
  textarea: {
    flexGrow: 1,
    fontSize: "16px",
    height: "100%",
    boxSizing: "border-box",
    ...shorthands.padding("8px"),
    ...shorthands.borderRadius("12px"),
    width: "100%",
    boxShadow: "0px 0.3px 0.9px rgba(0, 0, 0, 0.12), 0px 1.6px 3.6px rgba(0, 0, 0, 0.16)",
    resize: "none"
  },
  sendButton: {
    flexGrow: 0,
    ...shorthands.padding("8px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "48px",
    width: "48px",
    ...shorthands.borderRadius("50%"),
    ...shorthands.border("1px", "solid", "transparent"),
    backgroundColor: "rgb(145, 72, 135)",
    color: "#fff",
    cursor: "pointer",
    ":disabled": {
      backgroundColor: "#dddddd",
      cursor: "not-allowed"
    }
  },
  image: {
    maxWidth: "320px",
    maxHeight: "320px",
    width: "auto",
    height: "auto"
  },
  loading: {
    width: "64px",
    height: "64px",
    animationName: {
      from: {
        transform: "rotate(0deg)"
      },
      to: {
        transform: "rotate(360deg)"
      },
    },
    animationDuration: "3s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  messageOptions: {
    marginTop: "8px"
  },
  option: {
    display: "flex",
    marginTop:"8px",
    columnGap: "8px"
  },
  sendButtonTiny: {
    height: "24px",
    width: "24px",
    flexShrink: 0,
    ...shorthands.padding("4px"),
    backgroundColor: "#663f2a"
  }
});

export const ChatApp = () => {
  const classNames = useStyles();
  const [text, setText] = React.useState<string>("");
  const [messages, setMessages] = React.useState<IMessage[]>([{
    content: "Hello, I'm your image bot. How can I help you?",
    source: "openai-bot"
  }]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const messageListRef = React.useRef<HTMLDivElement>(null)

  const scrollMessageToBottom = React.useCallback(() => {
    messageListRef.current?.scrollTo({top: messageListRef.current?.scrollHeight, behavior: "smooth"})
  }, [])

  const onSend = React.useCallback(async () => {
    setMessages(prevMessages => [...prevMessages, {content: text, source: "user"}]);
    scrollMessageToBottom();
    setText("");
    setLoading(true);
    try {
      const prompts = await getPrompt(text);
      if (!prompts || prompts.length === 0) {
        setMessages(prevMessages => [...prevMessages, {content: "Can not get any useful information for image generation from giving content.", source: "openai-bot"}]);
        scrollMessageToBottom();
      } else {
        setMessages(prevMessages => [...prevMessages, {content: "Please choose an option that is match your imagination to generate a picture.", source: "openai-bot", options: prompts}]);
        scrollMessageToBottom();
      }
    } finally {
      setLoading(false);
    }
  }, [text]);

  const onDraw = React.useCallback(async (imagePrompt: string) => {
    setMessages(prevMessages => [...prevMessages, {content: imagePrompt, source: "user"}]);
    scrollMessageToBottom();
    setLoading(true);
    try {
      const response = await axios.post("/api/imagine", {prompt: imagePrompt});
      const imageUrl = response.data;
      setMessages(prevMessages => [...prevMessages, {content: "", imageUrl, source: "midjourney-bot"}]);
      scrollMessageToBottom();
    } finally {
      setLoading(false);
    }
  }, [scrollMessageToBottom]);

  return <div className={classNames.root}>
    <div ref={messageListRef} className={classNames.messageList}>{
      messages.map((message, index) => {
        return <div
          className={message.source === "user" ? classNames.userMessageWrapper : classNames.botMessageWrapper}>
          <div
            key={index}
            className={message.source === "user" ? classNames.userMessage : classNames.botMessage}
          >
            <div>{message.content}</div>
            {message.imageUrl && (
              <div>
                <img alt="from-mid-journey" className={classNames.image} src={message.imageUrl}/>
              </div>
            )}
            {message.options && message.options.length && <div className={classNames.messageOptions}>{message.options.map((option, index) => {
              return <div key={index} className={classNames.option}>
                <button className={mergeClasses(classNames.sendButton, classNames.sendButtonTiny)} onClick={() => {onDraw(option)}} disabled={loading}>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
                    <path
                      d="M12.8147 12.1969L5.28344 13.4521C5.10705 13.4815 4.95979 13.6029 4.89723 13.7704L2.29933 20.7278C2.05066 21.3673 2.72008 21.9773 3.33375 21.6705L21.3337 12.6705C21.8865 12.3941 21.8865 11.6052 21.3337 11.3288L3.33375 2.32885C2.72008 2.02201 2.05066 2.63206 2.29933 3.2715L4.89723 10.2289C4.95979 10.3964 5.10705 10.5178 5.28344 10.5472L12.8147 11.8024C12.9236 11.8205 12.9972 11.9236 12.9791 12.0325C12.965 12.1168 12.899 12.1829 12.8147 12.1969Z"></path>
                  </svg>
                </button>
                <div>{option}</div>
              </div>
            })}</div>}
          </div>
        </div>;
      })
    }</div>
    <div>
      <img alt="loading" src={loadingIcon} className={classNames.loading}
           style={{visibility: loading ? "visible" : "hidden"}}/>
    </div>
    <div className={classNames.textareaWrapper}>
    <textarea
      className={classNames.textarea}
      value={text}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          onSend();
        }
      }}
      onChange={(event) => {
        setText(event.target.value);
      }}/>

      <button className={classNames.sendButton} onClick={onSend} disabled={loading || !text}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
          <path
            d="M12.8147 12.1969L5.28344 13.4521C5.10705 13.4815 4.95979 13.6029 4.89723 13.7704L2.29933 20.7278C2.05066 21.3673 2.72008 21.9773 3.33375 21.6705L21.3337 12.6705C21.8865 12.3941 21.8865 11.6052 21.3337 11.3288L3.33375 2.32885C2.72008 2.02201 2.05066 2.63206 2.29933 3.2715L4.89723 10.2289C4.95979 10.3964 5.10705 10.5178 5.28344 10.5472L12.8147 11.8024C12.9236 11.8205 12.9972 11.9236 12.9791 12.0325C12.965 12.1168 12.899 12.1829 12.8147 12.1969Z"></path>
        </svg>
      </button>
    </div>
  </div>;
};
