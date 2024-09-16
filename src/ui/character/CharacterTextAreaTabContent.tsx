import { isDefined, safe } from "@mjtdev/engine";
import { Button, Flex, Tabs, Text } from "@radix-ui/themes";
import type { AppCharacter, TavernCardV2 } from "ai-worker-common";
import { produce } from "immer";
import { memo, useRef, useState } from "react";
import { AiplEditor } from "../aipl/AiplEditor";
import type { AiplEditorRef } from "../aipl/AiplEditorRef";
import { stringifyEq } from "../chat/stringifyEq";
import { generateCharacterFieldPromptText } from "./generateCharacterFieldPromptText";
import { AppButton } from "../common/AppButton";

export const CharacterTextAreaTabContent = memo(
  ({
    tabKey,
    onChange,
    defaultValue,
    character,
    omitDataKey,
    extraDirection = "",
    example,
    helpText,
    generalHelpText = "Use AIPL code and template variables, note that characters like '(' and ')' must be escaped with a backslash like '\\('",
  }: {
    example?: string;
    extraDirection?: string;
    tabKey: string;
    omitDataKey: keyof TavernCardV2["data"];
    character: AppCharacter;
    defaultValue: string | undefined;
    onChange: (value: string) => void;
    helpText?: string;
    generalHelpText?: string;
  }) => {
    const ref = useRef<AiplEditorRef>(null);
    const [state, setState] = useState(
      produce(
        {
          abortController: undefined as undefined | AbortController,
        },
        () => {}
      )
    );
    const generatePromptText = (abortController: AbortController) => {
      const direction = [
        "You are an expert character description prompt engineer program.",
        "You take in character information and output text describing the character",
        `Use the existing entry for influence only. Don't parrot it back.`,
        "Use {{char}} to refer to the character and {{user}} to refer to the user",
        "DO NOT EXPlAIN OR MAKE COMMENTS! JUST PROVIDE THE FIELD CONTENTS ONLY!",
        "DO NOT REPEAT OR PLAGIARIZE from the character information below when generating field contents",
        "Only use the character information for reference! DO NOT COPY!",
      ]
        .filter(isDefined)
        .join("\n");

      return generateCharacterFieldPromptText({
        character,
        direction,
        extraDirection,
        fieldName: tabKey,
        omitDataKey,
        abortController,
        onChange: (change, final) => {
          if (ref.current) {
            ref.current.setValue(change);
          }
          if (final) {
            onChange(change);
          }
        },
        example,
      });
    };

    return (
      <Tabs.Content style={{ width: "100%" }} key={tabKey} value={tabKey}>
        <Flex
          style={{
            width: "100%",
            minWidth: "40ch",
            maxWidth: "80ch",
            height: "100%",
            maxHeight: "50vh",
          }}
          gap="2"
          direction={"column"}
        >
          {helpText && (
            <Flex
              gap={"2"}
              direction={"column"}
              style={{
                fontSize: "0.8em",
                paddingLeft: "1em",
              }}
            >
              <Text>{helpText}</Text>
              <Text>{generalHelpText}</Text>
              <Text>
                <a
                  target="_blank"
                  href="https://github.com/AIPL-labs/aipl/blob/master/ai-programming-language-0.10.md"
                >
                  AIPL documentaton
                </a>
              </Text>
            </Flex>
          )}

          <Flex
            style={{ border: "1px solid grey", width: "100%", height: "100%" }}
          >
            <AiplEditor
              fieldName={omitDataKey}
              characterId={character.id}
              ref={ref}
              defaultValue={defaultValue}
              onChange={(value) => onChange(value)}
            />
          </Flex>

          <Flex gap="2">
            <AppButton
              tooltip={`Generate ${tabKey} prompt text`}
              color={state.abortController ? "amber" : "green"}
              onClick={async () => {
                if (state.abortController) {
                  state.abortController.abort();
                  setState(
                    produce(state, (s) => {
                      s.abortController = undefined;
                    })
                  );

                  return;
                }

                const abortController = new AbortController();
                setState(
                  produce(state, (s) => {
                    s.abortController = abortController;
                  })
                );
                await safe(() => generatePromptText(abortController));
                setState(
                  produce(state, (s) => {
                    s.abortController = undefined;
                  })
                );
              }}
            >
              {state.abortController ? "Cancel" : "Generate"}
            </AppButton>
          </Flex>
        </Flex>
      </Tabs.Content>
    );
  },
  stringifyEq
);
