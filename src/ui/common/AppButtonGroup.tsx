import { Button, Flex, Text, type FlexProps } from "@radix-ui/themes";
import { Prompts } from "ai-worker-common";
import type { CSSProperties } from "react";
import { formatAndCapitalize } from "../../common/formatAndCapitalize";
import type { RadixColor } from "./RADIX_COLORS";

export const AppButtonGroup = ({
  actions = {},
  // style = {},
  buttonStyle = {},
  // direction,
  colors = {},
  templateVars = {},
  disableds = {},
  ...rest
}: {
  // direction?: "row" | "column" | "row-reverse" | "column-reverse";
  // style?: CSSProperties;
  buttonStyle?: CSSProperties;
  actions?: Record<string, () => void>;
  templateVars?: Record<string, string | undefined>;
  colors?: Record<string, RadixColor>;
  disableds?: Record<string, boolean>;
} & Partial<FlexProps>) => {
  const contents = Object.entries(actions).map((entry) => {
    const [key, value] = entry;
    return (
      <Button
        disabled={disableds[key]}
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...buttonStyle,
        }}
        color={colors[key]}
        onClick={value}
        key={key}
      >
        <Text
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...buttonStyle,
          }}
        >
          {formatAndCapitalize(Prompts.renderTemplateText(key, templateVars))}
        </Text>
      </Button>
    );
  });
  return (
    <Flex wrap={"wrap"} gap="1" {...rest}>
      {contents}
    </Flex>
  );
};
