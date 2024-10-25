import type { AppCharacter } from "ai-worker-common";
import { DatasState } from "../../state/data/DatasState";

export const loadCharacterImage = async (character: AppCharacter) => {
  if (!character.imageDataId) {
    return undefined;
  }
  return DatasState.getData(character.imageDataId);
};
