import { isUndefined, type ByteLike } from "@mjtdev/engine";
import { useEffect, useRef, useState } from "react";
import { DataImage } from "../image/DataImage";
import { Asrs } from "ai-worker-common";
import {
  getCustomAsrState,
  updateCustomAsrState,
} from "../../asr-custom/updateCustomAsrState";
import { AsrCustoms } from "../../asr-custom/AsrCustoms";

export const VideoPlayer = ({
  video,
  placeholder,
  controls,
  ...rest
}: React.HtmlHTMLAttributes<HTMLVideoElement> & {
  video?: ByteLike;
  placeholder?: ByteLike;
  controls?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false); // Default to not showing the play button

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let objectURL: string | null = null;

    if (video instanceof Blob) {
      objectURL = URL.createObjectURL(video);
    } else if (video instanceof ArrayBuffer) {
      const blob = new Blob([video], { type: "video/mp4" });
      objectURL = URL.createObjectURL(blob);
    } else {
      return;
    }

    if (objectURL) {
      videoElement.src = objectURL;
      const asrWasEnabled = getCustomAsrState().enabled;

      // Check autoplay permission by attempting to play the video
      AsrCustoms.stopVadAsr().then(() => {
        videoElement.play().catch((err) => {
          // If the play attempt fails due to user interaction restrictions, show the play button
          if (err.name === "NotAllowedError") {
            setShowPlayButton(true);
          }
        });
      });

      videoElement.addEventListener("ended", () => {
        if (asrWasEnabled) {
          AsrCustoms.startCustomAsr();
        }
      });

      return () => {
        videoElement.pause();
        videoElement.src = "";
        if (objectURL) {
          URL.revokeObjectURL(objectURL);
        }
      };
    }
  }, [video]);

  const handlePlayButtonClick = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play();
      setShowPlayButton(false); // Hide play button once video starts
    }
  };

  if (isUndefined(video)) {
    return (
      <DataImage
        style={{ maxHeight: "10em", maxWidth: "10em" }}
        bytes={placeholder}
      />
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {showPlayButton && (
        <button
          onClick={handlePlayButtonClick}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1em 2em",
            background: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          Play
        </button>
      )}
      <video
        ref={videoRef}
        style={{ width: "100%", height: "auto" }}
        controls={controls}
        {...rest}
      />
    </div>
  );
};
