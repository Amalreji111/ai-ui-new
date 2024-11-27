import { Datas } from "ai-worker-common";
import { Returns } from "../data-object/Returns";
import { getHomeAuth } from "../getHomeAuth";
import { AppMessagesState } from "../ws/AppMessagesState";

export const deleteDataId = async (dataId: string | undefined) => {
  if (!dataId) {
    return undefined;
  }
  return Datas.deleteRemoteData({ id: dataId, ...getHomeAuth() });
};

export const putBlob = async ({ id, blob }: { id: string; blob: Blob }) => {
  return await Datas.putRemoteData({
    data: blob,
    id,
    ...getHomeAuth(),
    options: {
      mediaType: blob.type,
    },
  });
};

export const putData = async ({
  id,
  data,
  mediaType,
}: {
  id: string;
  data: BodyInit;
  mediaType?: string;
}) => {
  return Datas.putRemoteData({
    data,
    id,
    ...getHomeAuth(),
    options: { mediaType },
  });
};

export const getData = (
  id: string | undefined,
  options: Partial<{
    maxWaitMs: number;
  }> = {}
) => {
  const error = new Error(`timeout getting ${id}`);
  const { maxWaitMs = 60 * 2 * 1000 } = options;
  return new Promise<Blob | undefined>((resolve, reject) => {
    if (!id) {
      return resolve(undefined);
    }
    const returnId = Returns.addReturnListener<{
      data: ArrayBuffer;
      contentType: string;
    }>({
      onReturn: async (msg) => {
        const { data } = msg;
        const blob = new Blob([data], { type: msg.contentType });
        resolve(blob);
      },
      onTimeout: () => {
        reject(error);
      },
      maxWaitMs,
    });
    AppMessagesState.dispatch({
      type: "data:get",
      detail: { returnId, id },
    });
  });
};

export const DatasState = {
  getData,
  deleteDataId,
  putData,
  putBlob,
};
