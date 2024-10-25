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
} from "ai-worker-common";
import { produce } from "immer";
import { useEffect, useState } from "react";
import { formatAndCapitalize } from "../../common/formatAndCapitalize";
import { AppEvents } from "../../event/AppEvents";
import { DatasState } from "../../state/data/DatasState";
import { useUserState } from "../../state/user/UserState";
import { useActiveGroup } from "../../state/user/useActiveGroup";
import { DEFAULT_CHAR_URL } from "../DEFAULT_CHAR_URL";
import { createDummyAiplContext } from "../aipl/createDummyAiplContext";
import { Avatar3dCharacterEditorContent } from "../avatar3d/Avatar3dCharacterEditorContent";
import { AppButton } from "../common/AppButton";
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

  const [resultAvatar3d, setResultAvatar3d] = useState<ByteLike | undefined>(
    undefined
  );

  useEffect(() => {
    if (!character.imageDataId) {
      Images.toBlob(DEFAULT_CHAR_URL).then((blob) => {
        setResultImage(blob);
      });
      return;
    }
    DatasState.getData(character.imageDataId).then(async (blob) => {
      setResultImage(blob);
      const { voiceSample, videoPack, avatar3d } =
        await AppImages.pngToTavernCardAndVoiceSample(blob, {
          extraExtractions: ["avatar3d", "videoPack", "voiceSample"],
        });
      console.log("avatar3d", avatar3d);
      if (isDefined(voiceSample)) {
        setResultVoiceSample(voiceSample.slice(0));
      }
      if (isDefined(videoPack)) {
        const videos = AppVideos.videoPackToVideoRecords(videoPack);
        setResultVideos(videos);
      }
      if (isDefined(avatar3d)) {
        setResultAvatar3d(avatar3d);
      }
    });
  }, [character.id, character.imageDataId]);
  if (!resultCharacter) {
    return <>CharacterEditor: no result</>;
  }

  const CHARACTER_DATA_TAB_TO_TOOL_TIP: Record<CharacterDataTab, string> = {
    preChat: "AIPL code that will be run before the chat starts",
    greeting: "Character's greeting message",
    description: "Description of the character",
    scenerio: "Scenario description",
    videos: "Video content related to the character such as greeting video",
    voice: "Voice settings and options for the character",
    image: "The character's image",
    personality: "Character's personality traits",
    system: "Direct system prompts for the character",
    direction:
      "USE WITH CAUTION! Guidance and direction settings for the character that have an outsized impact on the character's behavior",
    tags: "Tags delimited by commas for categorizing the character",
    notes: "Additional notes about the character, not used by prompting",
    starters: "Starter phrases for conversations, one per line",
    "Chat End":
      "AIPL code that will be run after the chat has been detected to have ended",
    access: "Access control settings for services",
    secrets: "Confidential information that can be used inside of AIPL code",
    formSkill: "Skills related to form handling",
    "Msg Examples":
      "Examples of previous messages to help the character stay in character during the conversation",
    reports: "Reports generated by the character during interactions",
    functions: "Functions that the character knows how to use",
    "3D Avatar": "3D avatar for the character",
  };
  const CHARACTER_DATA_TAB_CONTENTS = {
    preChat: (
      <CharacterTextAreaTabContent
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["preChat"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["greeting"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["description"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["scenerio"]}
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
      <Tabs.Content
        style={{ width: "100%", height: "100%" }}
        key={"image"}
        value={"image"}
      >
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
    "3D Avatar": (
      <Tabs.Content
        style={{ width: "100%", height: "100%" }}
        key={"3D Avatar"}
        value={"3D Avatar"}
      >
        <Avatar3dCharacterEditorContent
          character={resultCharacter}
          onChange={(value) => {
            setResultAvatar3d(value);
          }}
          value={resultAvatar3d}
        />
      </Tabs.Content>
    ),
    personality: (
      <CharacterTextAreaTabContent
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["personality"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["system"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["direction"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["tags"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["notes"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["starters"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["Chat End"]}
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
        helpText={CHARACTER_DATA_TAB_TO_TOOL_TIP["Msg Examples"]}
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
    media: ["3D Avatar", "image", "videos", "voice"],
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

  const TAB_GROUP_TO_TOOL_TIP: Record<(typeof TAB_GROUPS)[number], string> = {
    prompting:
      "AIPL/natural language prompt text to control the character's behavior",
    media: "Audio and visual media for the character",
    settings: "Access and secrets for the character",
    capabilities: "Character capabilities and functions",
    metadata: "Tags and notes for the character",
  };
  const topLevelTabs = TAB_GROUPS.map((tabGroupKey, i) => (
    <Flex
      style={{ width: "100%", height: "fit-content" }}
      key={i}
      direction={"column"}
    >
      <AppButton
        tooltip={TAB_GROUP_TO_TOOL_TIP[tabGroupKey]}
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
          .map((characterDataTabKey, i) => (
            <AppButton
              key={i}
              tooltip={CHARACTER_DATA_TAB_TO_TOOL_TIP[characterDataTabKey]}
              size={"1"}
              color={characterDataTabKey === tab ? "amber" : undefined}
              variant="outline"
              onClick={() => setTab(characterDataTabKey)}
            >
              {formatAndCapitalize(characterDataTabKey)}
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
        <Flex
          style={{ width: "100%", minWidth: "80ch", minHeight: "60vh" }}
          mt="2"
          gap="3"
        >
          <Flex
            style={{
              maxHeight: "60vh",
              width: "15ch",
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
              // direction={"column"}
              flexGrow="1"
              align="start"
              style={{
                width: "100%",
                minHeight: "20em",
                // minHeight: "80vh",

                minWidth: "80ch",
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
                    videos: resultVideos,
                    avatar3d: resultAvatar3d,
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
