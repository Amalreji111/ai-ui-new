import { Avatar3d } from "@mjtdev/avatar-3d";
import {
  Animates,
  Colors,
  Objects,
  isDefined,
  type ArcRotateCameraOptions,
  type ByteLike,
} from "@mjtdev/engine";
import {
  Badge,
  Card,
  CardProps,
  Flex,
  Separator,
  Text,
} from "@radix-ui/themes";
import type { AppCharacter } from "ai-worker-common";
import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { memo, useEffect, useState } from "react";
import { getTtsState } from "../../tts/TtsState";
import { DEFAULT_CHAR_URL } from "../DEFAULT_CHAR_URL";
import { AppButtonGroup } from "../common/AppButtonGroup";
import { AppContextMenu } from "../common/AppContextMenu";
import { CorpusDocumentListButton } from "../corpus/CorpusDocumentListButton";
import { addCorpusDocumentsWithFilesToParentDataObject } from "../corpus/addCorpusDocumentsFilesToParentDataObject";
import { DataImage } from "../image/DataImage";
import { idToColor } from "../visual/idToColor";
import { VideoPlayer } from "./VideoPlayer";
import type { CharacterAction } from "./characterToActions";
import { characterToActions } from "./characterToActions";
// import { stringifyEq } from "../chat/stringifyEq";

export const stringifyEq2 = (a: any, b: any) => {
  if (a instanceof AnalyserNode || b instanceof AnalyserNode) {
    return a === b;
  }

  const result = JSON.stringify(a) === JSON.stringify(b);
  // if (!result) {
  //   console.log("stringifyEq", { a, b });
  // }
  return result;
};

export const CharacterAvatar = memo(
  ({
    imageStyle = {},
    style = {},
    nameStyle = {},
    character,
    video,
    showName = true,
    showTags = false,
    showNotes = false,
    showHoverButtons = true,
    showActionButtons = false,
    showContextMenu = true,
    show3dAvatar = false,
    enableDocumentDrop = true,
    hoverActions,
    buttonActions = [],
    onClick = () => {},
    analyserNode,
    avatar3dCanvasWidth,
    avatar3dCanvasHeight,
    avatar3dCameraOptions,
    ...rest
  }: CardProps & {
    video?: ByteLike;
    enableDocumentDrop?: boolean;
    showHoverButtons?: boolean;
    hoverActions?: CharacterAction[];
    buttonActions?: CharacterAction[];
    showActionButtons?: boolean;
    showName?: boolean;
    showTags?: boolean;
    showNotes?: boolean;
    showContextMenu?: boolean;
    show3dAvatar?: boolean;
    avatar3dCanvasWidth?: number;
    avatar3dCanvasHeight?: number;
    imageStyle?: CSSProperties;
    nameStyle?: CSSProperties;
    style?: CSSProperties;
    character: AppCharacter | undefined;
    onClick?: (characterId: string) => void;
    analyserNode?: AnalyserNode;
    avatar3dCameraOptions?: ArcRotateCameraOptions;
  }) => {
    const [pointerOver, setPointerOver] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);

    const backgroundColor = Colors.from("black").alpha(0.5).toString();
    const nameDisplay = showName ? (
      <Text style={{ ...nameStyle }}>{character?.card?.data?.name}</Text>
    ) : undefined;
    if (!character) {
      return <></>;
    }

    useEffect(() => {
      if (!character?.card?.data?.extensions?.avatar3dUrl) {
        return;
      }
      // if (currentSource && analyserNode) {
      //   currentSource.connect(analyserNode);
      // }

      const ac = Animates.create({
        ticker: () => {
          const currentSource = getTtsState().currentSource;
          if (currentSource && analyserNode) {
            currentSource.connect(analyserNode);
          }
        },
      });

      // Ttss.toggleTts().then(async () => {
      //   console.log("TTS toggled to regain audiocontext");
      //   await Ttss.toggleTts();
      //   console.log("TTS toggled back");
      // });
      return () => {
        ac.destroy();
      };
    }, [analyserNode, character]);

    const tags = character?.card?.data?.tags ?? [];

    const tagColors = tags.map((tag) => {
      const backgroundColor = idToColor(tag);
      const color = Colors.textColor([backgroundColor]);
      return { color, backgroundColor } as const;
    });

    const fullActionMap = characterToActions(character);
    const hoverActionMap = hoverActions
      ? Objects.fromEntries(
          Objects.entries(fullActionMap)
            .filter(([key]) => hoverActions.includes(key))
            .sort((a, b) => a[0].localeCompare(b[0]))
        )
      : fullActionMap;

    const buttonActionMap = buttonActions
      ? Objects.fromEntries(
          Objects.entries(fullActionMap)
            .filter(([key]) => buttonActions.includes(key))
            .sort((a, b) => a[0].localeCompare(b[0]))
        )
      : fullActionMap;

    const templateVars = {
      char: character?.card?.data?.name,
    } as const;

    return (
      <AppContextMenu templateVars={templateVars} actions={hoverActionMap}>
        <Card
          onPointerOver={() => setPointerOver(true)}
          onPointerLeave={(evt) => {
            if (!enableDocumentDrop) {
              return;
            }
            evt.preventDefault();
            setPointerOver(false);
          }}
          onDragLeave={(evt) => {
            if (!enableDocumentDrop) {
              return;
            }
            setPointerOver(false);
          }}
          onDragEnter={(evt) => {
            if (!enableDocumentDrop) {
              return;
            }
            setPointerOver(true);
          }}
          onDragOver={(evt) => {
            if (!enableDocumentDrop) {
              return;
            }
            evt.dataTransfer.dropEffect = "copy";
            setPointerOver(true);
          }}
          onDrop={(evt) => {
            if (!enableDocumentDrop) {
              return;
            }
            addCorpusDocumentsWithFilesToParentDataObject(
              character.id,
              Array.from(evt.dataTransfer.files)
            );
          }}
          onClick={() => onClick(character.id)}
          style={{
            position: "relative",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            ...style,
          }}
          {...rest}
        >
          <Flex gap="2" direction={"column"}>
            <Flex>
              <AnimatePresence mode="wait">
                {isDefined(video) && !videoEnded ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 2 } }}
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    key="greeting-video-active-motion"
                  >
                    <VideoPlayer
                      style={{ maxHeight: "50vh", maxWidth: "80vw" }}
                      onEnded={() => {
                        setVideoEnded(true);
                      }}
                      video={video}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    key="greeting-image-active-motion"
                  >
                    {show3dAvatar &&
                    character.card.data.extensions?.avatar3dUrl ? (
                      <Flex
                        style={{
                          maxHeight: "40vh",
                          maxWidth: "40vw",
                          overflow: "auto",
                          ...style,
                        }}
                      >
                        <Avatar3d
                          path={character.card.data.extensions.avatar3dUrl}
                          analyserNode={analyserNode}
                          canvasWidth={avatar3dCanvasWidth}
                          canvasHeight={avatar3dCanvasHeight}
                          canvasStyle={{ maxWidth: "40vw", maxHeight: "40vh" }}
                          gltfCameraOptions={avatar3dCameraOptions}
                          animationPath={
                            character.card.data.extensions.avatar3dAnimationUrl
                          }
                          vrmCameraOptions={{
                            frustumSize: 0.7,
                            position: { x: 0, y: 1.85, z: 3 },
                            lookAt: { x: 0, y: 1.85, z: 0 },
                          }}

                          // showPhonemes={true}
                          // showControls={true}
                        />
                      </Flex>
                    ) : (
                      <DataImage
                        key={character.imageDataId}
                        style={imageStyle}
                        dataId={character.imageDataId}
                        src={DEFAULT_CHAR_URL}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Flex>

            {nameDisplay}
            {showTags || showNotes ? <Separator size={"4"} /> : undefined}
            {showNotes ? (
              <Flex wrap={"wrap"}>
                <Text
                  style={{
                    whiteSpace: "pre-wrap",
                    maxHeight: "6em",
                    // width: "20em",
                    width: "90%",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  {character.card.data.creator_notes}
                </Text>
              </Flex>
            ) : undefined}

            {showTags ? (
              <Flex
                wrap={"wrap"}
                gap="1"
                style={{
                  maxHeight: "6em",
                  width: "90%",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {tags.map((tag, i) => (
                  <Badge
                    style={{
                      backgroundColor: tagColors[i].backgroundColor,
                      color: tagColors[i].color,
                    }}
                    key={i}
                  >
                    {tag}
                  </Badge>
                ))}
              </Flex>
            ) : undefined}
            {showHoverButtons && pointerOver ? (
              <CorpusDocumentListButton
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor,
                }}
                parentId={character.id}
              />
            ) : undefined}
            {showActionButtons ? (
              <AppButtonGroup
                templateVars={templateVars}
                direction="column"
                actions={buttonActionMap}
              />
            ) : undefined}
          </Flex>
        </Card>
      </AppContextMenu>
    );
  },
  stringifyEq2
);
