import { isUndefined } from "@mjtdev/engine";
import { AppMessagesState } from "../../state/ws/AppMessagesState";
import { getCurrentChat } from "../../ui/chat/getCurrentChat";
import { audioPlayer } from "../../audio/AudioClipPlayer";
import { convertToBoolean, getQueryParam } from "../../app-front/xmas-betty-circular/utils/utils";
import { simliClient } from "../../app-front/xmas-betty-circular/components/SimliCharacter";
import { updateTtsState } from "../TtsState";

export const interruptTts = async (reason = "unknown") => {
  // console.log(`interruptTts: ${reason}`);
  const chat = await getCurrentChat();
  if (isUndefined(chat?.id)) {
    console.warn("ignoring interrupt. NO current chat");
    return;
  }
  const isSimliEnabled = getQueryParam("isSimliEnabled", "true");
  if(convertToBoolean(isSimliEnabled)){
    updateTtsState((s) => {
      s.isSpeaking = false
    })
  simliClient.ClearBuffer();
  }

  AppMessagesState.dispatch({
    type: "abort",
    detail: chat.id,
  });
  audioPlayer.interrupt();
};
