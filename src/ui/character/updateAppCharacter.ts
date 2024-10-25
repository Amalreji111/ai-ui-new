import { Bytes, isDefined } from "@mjtdev/engine";
import type { AppCharacter, DecomposedAppCharacter } from "ai-worker-common";
import { AppImages, uniqueId } from "ai-worker-common";
import { AppEvents } from "../../event/AppEvents";
import { DataObjectStates } from "../../state/data-object/DataObjectStates";
import { DatasState } from "../../state/data/DatasState";
import { getUserState } from "../../state/user/UserState";
import { switchActiveGroup } from "../../state/user/switchActiveGroup";
import { AppMessagesState } from "../../state/ws/AppMessagesState";
import { Returns } from "../../state/data-object/Returns";

export const updateAppCharacter = async (
  decomposedAppCharacter: DecomposedAppCharacter | undefined
) => {
  if (!decomposedAppCharacter) {
    return;
  }

  const { id: userId } = getUserState();
  if (!userId) {
    return AppEvents.dispatchEvent(
      "error",
      "openCharacterEditor: missing userId"
    );
  }

  const imageDataId = uniqueId("data");

  const imagedCharacter: AppCharacter = {
    ...decomposedAppCharacter.character,
    imageDataId,
  };

  console.log("updateAppCharacter videos", decomposedAppCharacter.videos);
  const imageBlob = await AppImages.decomposedAppCharacterToPng({
    character: imagedCharacter,
    image: decomposedAppCharacter.image,
    voiceSample: decomposedAppCharacter.voiceSample,
    activeGroupId: decomposedAppCharacter.activeGroupId,
    videos: decomposedAppCharacter.videos,
    avatar3d: decomposedAppCharacter.avatar3d,
  });

  console.log("updateAppCharacter imageBlob", imageBlob);

  // await DatasState.putBlob({
  //   blob: imageBlob,
  //   id: imageDataId,
  // });

  const returnId = Returns.addReturnListener({
    onReturn: async (value) => {
      console.log("updateAppCharacter: return from putting image", value);
      DataObjectStates.upsertDataObject({
        objectType: "app-character",
        parentId: userId,
        draft: imagedCharacter,
      });

      if (isDefined(decomposedAppCharacter.activeGroupId)) {
        await switchActiveGroup({
          subjectId: imagedCharacter.id,
          activeId: decomposedAppCharacter.activeGroupId,
        });
      }

      // TODO HACK invalidating worker caches on character access update
      AppMessagesState.dispatch({
        type: "app:invalidateCaches",
        detail: undefined,
      });
    },
    maxWaitMs: 60_000,
  });
  const imageBytes = await Bytes.toArrayBuffer(imageBlob);
  console.log("updateAppCharacter imageBytes", imageBytes);
  AppMessagesState.dispatch({
    type: "data:put",
    detail: {
      id: imageDataId,
      data: imageBytes,
      returnId,
      contentType: "image/png",
    },
  });

  // AppMessagesState.

  console.log(
    `updateAppCharacter: updating character: ${imagedCharacter.id}`,
    imagedCharacter
  );
};
