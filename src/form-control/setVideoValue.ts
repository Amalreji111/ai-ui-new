import { isUndefined } from "@mjtdev/engine";
import { AppImages, AppVideos, type AppCharacter } from "ai-worker-common";
import { DataObjectStates } from "../state/data-object/DataObjectStates";
import { DatasState } from "../state/data/DatasState";
import { getCurrentChat } from "../ui/chat/getCurrentChat";

export const setVideoValue = async ({
  query,
  value,
}: {
  query: string;
  value: string;
}) => {
  const videoContainer = document.querySelector(query);
  if (!videoContainer || !(videoContainer instanceof HTMLVideoElement)) {
    console.error(`Video element not found for query: ${query}`);
    return;
  }
  if (value === currentVideoValue) {
    return;
  }
  currentVideoValue = value;

  const chat = await getCurrentChat();
  console.log("chat", chat);
  const assistantId = chat?.aiCharacterId;
  const character =
    await DataObjectStates.getDataObject<AppCharacter>(assistantId);
  console.log("assistant", character);
  if (isUndefined(character)) {
    console.error("assistant not found for id", assistantId);
    return;
  }
  const { imageDataId } = character;
  if (isUndefined(imageDataId)) {
    console.error("imageDataId not found for assistant", character);
    return;
  }
  const blob = await DatasState.getData(imageDataId);
  const { videoPack } = await AppImages.pngToTavernCardAndVoiceSample(blob, {
    extraExtractions: ["videoPack"],
  });
  const videos = AppVideos.videoPackToVideoRecords(videoPack);
  console.log("videos", videos);
  const videoBytes = videos[value];
  console.log("videoBytes", videoBytes);
  playVideo(videoBytes, videoContainer);
};

// Keep track of the current object URL
let currentVideoUrl: string | undefined = undefined;
let currentVideoValue: string | undefined = undefined;

// Function to load and play the video
function playVideo(videoBytes: ArrayBuffer, videoElement: HTMLVideoElement) {
  // If there is an existing video URL, revoke it to free memory
  if (currentVideoUrl) {
    URL.revokeObjectURL(currentVideoUrl);
    currentVideoUrl = undefined;
  }

  // Convert the ArrayBuffer to a Blob
  const videoBlob = new Blob([videoBytes], { type: "video/mp4" }); // Adjust MIME type as needed

  // Create a new URL from the Blob
  currentVideoUrl = URL.createObjectURL(videoBlob);

  // Set the video URL as the source of the video element
  videoElement.src = currentVideoUrl;

  // Optionally, start playing the video automatically
  videoElement.play().catch((error) => {
    console.error("Error playing video:", error);
  });
}
