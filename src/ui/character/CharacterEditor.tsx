import type { ByteLike } from "@mjtdev/engine";
import { Images, Objects, isDefined, isEmpty } from "@mjtdev/engine";
import { Flex, Tabs, Text } from "@radix-ui/themes";
import type { AppCharacter, DecomposedAppCharacter } from "ai-worker-common";
import {
  AiCharacters,
  Aipls,
  AppImages,
  AppObjects,
  AppVideos,
  Datas,
} from "ai-worker-common";
import { produce } from "immer";
import { useEffect, useState } from "react";
import { formatAndCapitalize } from "../../common/formatAndCapitalize";
import { AppEvents } from "../../event/AppEvents";
import { getHomeAuth } from "../../state/getHomeAuth";
import { useUserState } from "../../state/user/UserState";
import { useActiveGroup } from "../../state/user/useActiveGroup";
import { DEFAULT_CHAR_URL } from "../DEFAULT_CHAR_URL";
import { createDummyAiplContext } from "../aipl/createDummyAiplContext";
import { FormInputDisplay } from "../form/FormInputDisplay";
import { DataImage } from "../image/DataImage";
import { ImageGenerationPopup } from "../image/ImageGenerationPopup";
import { CharacterSecretsEditor } from "../secrets/SecretsWindow";
import { VideosEditor } from "../video/VideosEditor";
import { VoiceEditor } from "../voice/VoiceEditor";
import { CharacterFormSkillTabContent } from "./CharacterFormSkillTabContent";
import { CharacterFunctionsTabContent } from "./CharacterFunctionsTabContent";
import { CharacterReportsTabContent } from "./CharacterReportsTabContent";
import { CharacterTextAreaTabContent } from "./CharacterTextAreaTabContent";
import { ModifyCharacterAccess } from "./access/ModifyCharacterAccess";
import { AppButton } from "../common/AppButton";

export const CharacterEditor = ({
  character,
  onSubmit = () => {},
  defaultTab = "greeting",
  defaultTabGroup = "prompting",
}: {
  // defaultTab: keyof typeof CHARACTER_DATA_TAB_CONTENTS;
  defaultTab?: string;
  defaultTabGroup?: string;
  character: Partial<AppCharacter>;
  onSubmit?: (result: DecomposedAppCharacter | undefined) => void;
}) => {
  type CharacterDataTab = keyof typeof CHARACTER_DATA_TAB_CONTENTS;
  type TabGroup = (typeof TAB_GROUPS)[number];
  const { id: userId } = useUserState();

  const [tab, setTab] = useState(
    defaultTab as keyof typeof CHARACTER_DATA_TAB_CONTENTS
  );
  const [tabGroup, setTabGroup] = useState(defaultTabGroup as TabGroup);
  const [resultCharacter, setResultCharacter] = useState(
    produce(AppObjects.create("app-character", character), () => {})
  );
  const userActiveGroup = useActiveGroup(userId);
  const characterCurrentActiveGroup = useActiveGroup(resultCharacter?.id);
  const [resultImage, setResultImage] = useState<ByteLike | undefined>(
    undefined
  );
  const [resultActiveGroupId, setResultActiveGroupId] = useState<
    string | undefined
  >(characterCurrentActiveGroup?.id ?? userActiveGroup?.id);

  useEffect(() => {
    setResultActiveGroupId(
      characterCurrentActiveGroup?.id ?? userActiveGroup?.id
    );
  }, [userActiveGroup, characterCurrentActiveGroup]);

  const [resultVoiceSample, setResultVoiceSample] = useState<
    ByteLike | undefined
  >(undefined);

  const [resultVideos, setResultVideos] = useState<
    Record<string, ByteLike | undefined>
  >({});

  // const greetingAppVideo = DataObjectStates.useChildDataObjects(
  //   character.id,
  //   "app-video",
  //   "greeting"
  // )[0];
  useEffect(() => {
    // if (isDefined(greetingAppVideo)) {
    //   DatasState.dataIdToBlob(greetingAppVideo.dataId).then((blob) =>
    //     // setResultVideo(blob)
    //     setResultVideos({ greeting: blob })
    //   );
    // }
    if (!character.imageDataId) {
      Images.toBlob(DEFAULT_CHAR_URL).then((blob) => {
        setResultImage(blob);
      });
      return;
    }

    Datas.getRemoteData({ id: character.imageDataId, ...getHomeAuth() }).then(
      async (resp) => {
        if (!resp.ok) {
          return;
        }
        const blob = await resp.blob();
        setResultImage(blob);
        const { voiceSample, videoPack } =
          await AppImages.pngToTavernCardAndVoiceSample(blob);
        if (isDefined(voiceSample)) {
          setResultVoiceSample(voiceSample.slice(0));
        }
        if (isDefined(videoPack)) {
          const videos = AppVideos.videoPackToVideoRecords(videoPack);
          setResultVideos(videos);
        }
      }
    );
  }, [character.id, character.imageDataId]);
  if (!resultCharacter) {
    return <>CharacterEditor: no result</>;
  }

  const CHARACTER_DATA_TAB_CONTENTS = {
    preChat: (
      <CharacterTextAreaTabContent
        key="preChat"
        tabKey="preChat"
        omitDataKey="post_history_instructions"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data.extensions?.preChat}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.extensions = {
                ...(r.card.data.extensions ?? {}),
                preChat: value,
              };
            })
          );
        }}
      />
    ),
    greeting: (
      <CharacterTextAreaTabContent
        character={resultCharacter}
        key="greeting"
        tabKey="greeting"
        omitDataKey="first_mes"
        defaultValue={resultCharacter.card.data?.first_mes}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.first_mes = value;
            })
          );
        }}
      />
    ),
    description: (
      <CharacterTextAreaTabContent
        key="description"
        tabKey="description"
        omitDataKey="description"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data?.description}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.description = value;
            })
          );
        }}
      />
    ),
    scenerio: (
      <CharacterTextAreaTabContent
        key="scenerio"
        tabKey="scenerio"
        omitDataKey="scenario"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data?.scenario}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.scenario = value;
            })
          );
        }}
      />
    ),
    videos: (
      <Tabs.Content style={{ width: "100%" }} key={"videos"} value={"videos"}>
        <VideosEditor
          characterId={resultCharacter.id}
          defaultText={Aipls.renderAiplProgramText(
            resultCharacter.card.data.first_mes ?? "Hello my name is {char}",
            createDummyAiplContext({
              char: resultCharacter.card.data.name,
              assistant: resultCharacter.card.data.name,
            })
          )}
          image={resultImage}
          videos={resultVideos}
          onChangeVideos={(video) => {
            setResultVideos(video);
          }}
        />
      </Tabs.Content>
    ),
    voice: (
      <Tabs.Content style={{ width: "100%" }} key={"voice"} value={"voice"}>
        <VoiceEditor
          voiceSample={resultVoiceSample}
          character={resultCharacter}
          onChangeVoiceSample={(voiceSample) => {
            setResultVoiceSample(voiceSample);
          }}
          onChangeCharacter={(voiceStyle) => {
            setResultCharacter(
              produce(resultCharacter, (r) => {
                r.card.data.extensions = {
                  ...(r.card.data.extensions ?? {}),
                  voice: voiceStyle,
                };
              })
            );
          }}
        />
      </Tabs.Content>
    ),
    image: (
      <Tabs.Content key={"image"} value={"image"}>
        <ImageGenerationPopup
          character={resultCharacter}
          onGenerated={async (generatedImageAndPrompt) => {
            if (!generatedImageAndPrompt) {
              return;
            }
            const { image, prompt } = generatedImageAndPrompt;
            setResultImage(image);
            const updatedCharacter = produce(resultCharacter, (r) => {
              const { card } = r;
              const { data } = card;
              data.extensions = {
                ...card.data?.extensions,
                genInfo: {
                  ...(card.data.extensions?.genInfo ?? {}),
                  imagePrompt: prompt,
                },
              };
            });
            setResultCharacter(updatedCharacter);
          }}
          defaultImageId={character.imageDataId}
        />
      </Tabs.Content>
    ),
    personality: (
      <CharacterTextAreaTabContent
        key="personality"
        tabKey="personality"
        omitDataKey="personality"
        extraDirection=" be sure to include examples of how they speak in conversation"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data?.personality}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.personality = value;
            })
          );
        }}
      />
    ),
    system: (
      <CharacterTextAreaTabContent
        key="system"
        tabKey="system"
        omitDataKey="system_prompt"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data.system_prompt}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.system_prompt = value;
            })
          );
        }}
      />
    ),
    direction: (
      <CharacterTextAreaTabContent
        key="direction"
        tabKey="direction"
        omitDataKey="post_history_instructions"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data.post_history_instructions}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.post_history_instructions = value;
            })
          );
        }}
      />
    ),
    tags: (
      <CharacterTextAreaTabContent
        key="tags"
        tabKey="tags"
        omitDataKey="tags"
        character={resultCharacter}
        extraDirection="5 tags max"
        example={`smart, funny, doctor`}
        defaultValue={resultCharacter.card.data.tags?.join(", ")}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.tags = value.split(",").map((t) => t.trim());
            })
          );
        }}
      />
    ),
    notes: (
      <CharacterTextAreaTabContent
        key="notes"
        tabKey="notes"
        omitDataKey="creator_notes"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data.creator_notes}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.creator_notes = value;
            })
          );
        }}
      />
    ),
    starters: (
      <CharacterTextAreaTabContent
        key="starters"
        tabKey="starters"
        omitDataKey="creator_notes"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data.extensions?.starters?.join(
          "\n"
        )}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.extensions = {
                ...(r.card.data.extensions ?? {}),
                starters: value.split("\n").filter((s) => !isEmpty(s)),
              };
            })
          );
        }}
      />
    ),
    "Chat End": (
      <CharacterTextAreaTabContent
        key="Chat End"
        tabKey="Chat End"
        omitDataKey="post_history_instructions"
        character={resultCharacter}
        defaultValue={resultCharacter.card.data.extensions?.chatEnd}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.extensions = {
                ...(r.card.data.extensions ?? {}),
                chatEnd: value,
              };
            })
          );
        }}
      />
    ),
    access: (
      <Tabs.Content style={{ width: "100%" }} key={"access"} value={"access"}>
        <ModifyCharacterAccess
          activeGroupId={resultActiveGroupId}
          characterId={resultCharacter.id}
          onActiveGroupChange={(groupId) => {
            setResultActiveGroupId(groupId);
          }}
        />
      </Tabs.Content>
    ),
    secrets: (
      <Tabs.Content style={{ width: "100%" }} key={"secrets"} value={"secrets"}>
        <CharacterSecretsEditor characterId={resultCharacter.id} />
      </Tabs.Content>
    ),
    "Msg Examples": (
      <CharacterTextAreaTabContent
        key="Msg Examples"
        tabKey="Msg Examples"
        omitDataKey="mes_example"
        character={resultCharacter}
        example={AiCharacters.DEFAULT_MES_EXAMPLE}
        defaultValue={resultCharacter.card.data.mes_example}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.mes_example = value;
            })
          );
        }}
      />
    ),

    reports: (
      <CharacterReportsTabContent
        key="reports"
        tabKey="reports"
        defaultValue={resultCharacter.card.data.extensions?.reports ?? []}
        onReportChange={(index, report) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              const { extensions = {} } = r.card.data;
              const { reports = [] } = extensions;
              !report ? delete reports[index] : (reports[index] = report);
              extensions.reports = reports.filter(isDefined);
              r.card.data.extensions = { ...extensions };
            })
          );
        }}
        onChange={(reports) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.extensions = {
                ...(r.card.data.extensions ?? {}),
                reports,
              };
            })
          );
        }}
      />
    ),

    functions: (
      <CharacterFunctionsTabContent
        key={"functions"}
        tabKey={"functions"}
        character={resultCharacter}
        onChange={(functions: string[]): void => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.extensions = {
                ...(r.card.data.extensions ?? {}),
                functions,
              };
            })
          );
        }}
      />
    ),
    formSkill: (
      <CharacterFormSkillTabContent
        character={resultCharacter}
        tabKey="formSkill"
        key={"formSkill"}
        onChange={(value) => {
          setResultCharacter(
            produce(resultCharacter, (r) => {
              r.card.data.extensions = {
                ...(r.card.data.extensions ?? {}),
                formSkillConfigs: value,
              };
            })
          );
        }}
      />
    ),
  } as const;

  const TAB_GROUPS = [
    "prompting",
    "media",
    "settings",
    "capabilities",
    "metadata",
  ] as const;

  const TAB_GROUP_TO_CONTENT_TABs: Record<
    (typeof TAB_GROUPS)[number],
    CharacterDataTab[]
  > = {
    prompting: [
      "description",
      "personality",
      "scenerio",
      "system",
      "direction",
      "Msg Examples",
    ],
    media: ["image", "videos", "voice"],
    settings: ["access", "secrets"],
    capabilities: [
      "preChat",
      "greeting",
      "reports",
      "functions",
      "formSkill",
      "starters",
    ],
    metadata: ["tags", "notes"],
  };

  const topLevelTabs = TAB_GROUPS.map((tabGroupKey, i) => (
    <Flex key={i} direction={"column"}>
      <AppButton
        tooltip="Switch Tab Group"
        size={"1"}
        color={tabGroupKey === tabGroup ? "amber" : undefined}
        variant="outline"
        onClick={() => {
          setTabGroup(tabGroupKey);
          setTab(TAB_GROUP_TO_CONTENT_TABs[tabGroupKey][0]);
        }}
      >
        <Text
          style={{
            // HACK:stop long text cuttoff, bug in Radix Themes?
            width: `${tabGroupKey.length + 2}ch`,
            whiteSpace: "nowrap",
            userSelect: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formatAndCapitalize(tabGroupKey)}
        </Text>
      </AppButton>

      <Flex
        gap="1"
        wrap={"wrap"}
        style={{ marginTop: "0.5em", marginLeft: "1ch" }}
      >
        {Objects.keys(CHARACTER_DATA_TAB_CONTENTS)
          .filter((characterDataTabKey) => {
            return (
              TAB_GROUP_TO_CONTENT_TABs[tabGroupKey].includes(
                characterDataTabKey
              ) && tabGroupKey === tabGroup
            );
          })
          .map((characterDataTabKey) => (
            <AppButton
              tooltip="Switch Tab"
              size={"1"}
              color={characterDataTabKey === tab ? "amber" : undefined}
              variant="outline"
              onClick={() => setTab(characterDataTabKey)}
            >
              {characterDataTabKey}
            </AppButton>
          ))}
      </Flex>
    </Flex>
  ));

  return (
    <Flex
      style={{
        width: "100%",
        height: "fit-content",
        maxHeight: "80vh",
        maxWidth: "80vw",
        overflow: "auto",
      }}
      gap="2"
      direction="column"
    >
      <Flex align={"center"} gap={"3"}>
        <DataImage
          dataId={character.imageDataId}
          style={{ height: "8em" }}
          src={DEFAULT_CHAR_URL}
        />
        <Flex gap="2">
          <FormInputDisplay
            title="Name"
            key="name"
            defaultValue={resultCharacter.card.data.name}
            onChange={(value) => {
              setResultCharacter(
                produce(resultCharacter, (r) => {
                  r.card.data.name = value;
                })
              );
            }}
          />
          <AppButton
            tooltip="Copy Character ID"
            onClick={() => {
              console.log(resultCharacter.id);
              navigator.clipboard.writeText(resultCharacter.id);
              AppEvents.dispatchEvent(
                "toast",
                "Character ID copied to clipboard"
              );
            }}
          >
            ID
          </AppButton>
        </Flex>
      </Flex>

      <Tabs.Root value={tab}>
        <Flex style={{ width: "100%", minWidth: "80ch" }} mt="2" gap="3">
          <Flex
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
            }}
            direction={"column"}
            gap={"2"}
          >
            {topLevelTabs}
          </Flex>
          <Flex
            style={{
              width: "100%",
            }}
            direction={"column"}
          >
            <Flex
              flexGrow="1"
              style={{
                width: "100%",
                minHeight: "20em",

                minWidth: "80ch",
                // maxWidth: "40em",
                overflow: "auto",
              }}
            >
              {Objects.values(CHARACTER_DATA_TAB_CONTENTS)}
            </Flex>

            <Flex flexShrink={"1"} gap="3" mt="4" justify="center">
              <AppButton
                onClick={() => onSubmit(undefined)}
                variant="soft"
                color="gray"
              >
                Cancel
              </AppButton>
              <AppButton
                onClick={() =>
                  onSubmit({
                    character: resultCharacter,
                    image: resultImage,
                    voiceSample: resultVoiceSample,
                    activeGroupId: resultActiveGroupId,
                    // videos: { greeting: resultVideo },
                    videos: resultVideos,
                    // accessPublic: resultAccessPublic,
                  })
                }
              >
                Save
              </AppButton>
            </Flex>
          </Flex>
        </Flex>
      </Tabs.Root>
    </Flex>
  );
};
