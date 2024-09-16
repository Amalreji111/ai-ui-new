import { type ActionMap } from "@mjtdev/engine";
import type { AppCharacter } from "ai-worker-common";
import { AsrCustoms } from "../../asr-custom/AsrCustoms";
import { deleteCharacter } from "../../character/deleteCharacter";
import { duplicateCharacter } from "../../character/duplicateCharacter";
import { resetCharacter } from "../../character/resetCharacter";
import {
  getAppState,
  storeAppState,
  updateAppState,
} from "../../state/app/AppState";
import { startChatWithCharacters } from "../../state/chat/startChatWithCharacters";
import { startPhoneChatWithCharacters } from "../../state/chat/startPhoneChatWithCharacters";
import { DataObjectStates } from "../../state/data-object/DataObjectStates";
import { AppModes } from "../../state/location/AppModes";
import { AppMessagesState } from "../../state/ws/AppMessagesState";
import { Ttss } from "../../tts/Ttss";
import { switchWindow } from "../switchWindow";
import { downloadCharacterPng } from "./downloadCharacterPng";
import { openCharacterEditor } from "./openCharacterEditor";
import { openPublicAccessPointsDialog } from "./public-access/openPublicAccessPointsDialog";
import { openFormEditorPopup } from "../form/openFormEditorPopup";
import { openActionsDialog } from "./ActionsDialog";
import { closeAppPopup } from "../popup/closeAppPopup";

export type CharacterAction = keyof ReturnType<typeof characterToActions>;

export const characterToActions = (character: AppCharacter) =>
  ({
    download: async () => {
      return downloadCharacterPng(character);
    },
    delete: () => {
      // const confirm = openFormEditorPopup(
      //   { Yes: "", No: "" },
      //   { title: "Are you sure you want to delete this character?" }
      // );
      // deleteCharacter(character.id);
      openActionsDialog({
        gap: "2em",
        colors: { delete: "red" },
        actions: {
          delete: async () => {
            await deleteCharacter(character.id);
            closeAppPopup();
          },
          cancel: () => {
            closeAppPopup();
          },
        },
        title: "Are you sure you want to delete this character?",
      });
    },
    clearVectorStore: () => {
      AppMessagesState.dispatch({
        type: "vector:deleteNamespace",
        detail: character.id,
      });
    },
    "Edit {char}": () => openCharacterEditor(character),
    duplicate: () => duplicateCharacter(character.id),
    "Roleplay as {char}": () => {
      updateAppState((s) => {
        s.rolePlayAsCharacterId = character.id;
      });
      storeAppState();
    },
    reset: () => {
      resetCharacter(character.id);
    },
    "Chat With {char}": async () => {
      startChatWithCharacters({
        aiCharacterId: character.id,
        userCharacterId: getAppState().rolePlayAsCharacterId,
        // userCharacterId: (await getActiveProfile())?.userCharacterId,
      });
      await Ttss.enableTts();
      await AsrCustoms.startCustomAsr();
    },
    "Dev Chat With {char}": async () => {
      startChatWithCharacters({
        aiCharacterId: character.id,
        userCharacterId: getAppState().rolePlayAsCharacterId,
      });
      AppModes.addAppMode("dev");
      AppModes.addAppMode("inspect");
    },
    phoneWith: () => {
      startPhoneChatWithCharacters({ aiCharacterId: character.id });
      switchWindow("chat");
    },
    chatHistory: () => {
      DataObjectStates.findChildDataObjects(character.id, "chat");
      AppModes.upsertHashParam("characterId", character.id);
      switchWindow("chatHistory");
    },
    publicAccessPoints: () => {
      openPublicAccessPointsDialog({ characterId: character.id });
    },
  }) satisfies ActionMap;
