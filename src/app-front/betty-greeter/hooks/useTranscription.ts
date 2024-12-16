import { useState } from "react";
import { listChatMessages } from "../../../chat/listChatMessages";
import { AiFunctions, AppObjects, Chats } from "ai-worker-common";
import { useCustomAsrState } from "../../../asr-custom/updateCustomAsrState";
import { useCurrentChat } from "../../../ui/chat/useCurrentChat";
import { useIsTtsSpeaking } from "../../../tts/useIsTtsSpeaking";

const useTranscription = () => {
  const { chat, messages } = useCurrentChat();
  const { speaking: asrSpeaking } = useCustomAsrState();
  const [transcription, setTranscription] = useState("");
  const ttsSpeaking = useIsTtsSpeaking();

  // Filter chat messages and build realAndImaginedMessages array
  let realAndImaginedMessages: any[] = [];
  if (chat) {
    const orderedMessages = listChatMessages({
      messageId: chat?.currentMessageId,
      messages,
    }).filter((n) => n.role !== "system");

    const speakerMessage = asrSpeaking
      ? AppObjects.create("chat-message", {
          characterId: chat?.userCharacterId,
          content: { type: "text", parts: [] },
        })
      : AppObjects.create("chat-message", {
          characterId: chat.aiCharacterId,
        });

    realAndImaginedMessages = [...orderedMessages, speakerMessage].filter(Boolean);
  }

  // Extract the latest assistant message and its timestamp
  const transcript = listChatMessages({
    messageId: chat?.currentMessageId,
    messages,
  })
    .filter((n) => n.role === "assistant")
    ?.at(-1);

  const lastMessageTimestamp = messages.length > 0
    ? new Date(messages[messages.length - 1]?.createTime).getTime()
    : 0;

  let parseResult = null;
  if (transcript) {
    parseResult = AiFunctions.parseAiFunctionText(
      Chats.chatMessageToText(transcript),
      { aiFunctionPrefix: ".?" }
    );
  }

  return {
    transcription,
    setTranscription,
    realAndImaginedMessages,
    parseResult,
    lastMessageTimestamp,
  };
};

export default useTranscription;
