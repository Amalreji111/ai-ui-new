import { BrowserFiles } from "@mjtdev/engine";
import type { CorpusDocument } from "ai-worker-common";
import { AppEvents } from "../../event/AppEvents";
import { getDataObject } from "../../state/data-object/DataObjectStates";
import { DatasState } from "../../state/data/DatasState";

export const downloadCorpusDocument = async (documentId: string) => {
  const doc = await getDataObject<CorpusDocument>(documentId);
  if (!doc || !doc.dataId) {
    return;
  }
  const blob = await DatasState.getData(doc.dataId);
  if (!blob) {
    AppEvents.dispatchEvent("toast", `no document for id: ${doc.dataId}`);
    return;
  }

  BrowserFiles.writeFileBrowser(doc?.name ?? documentId, blob);
};
