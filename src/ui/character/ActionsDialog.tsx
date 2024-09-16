import { Flex } from "@radix-ui/themes";
import { AppButtonGroup } from "../common/AppButtonGroup";
import { openAppPopup } from "../popup/openAppPopup";

export const ActionsDialog = ({
  title,
  ...rest
}: {
  title: string;
} & Parameters<typeof AppButtonGroup>[0]) => {
  return (
    <Flex
      align={"center"}
      gap="2em"
      style={{ margin: "2em" }}
      direction={"column"}
    >
      <Flex>{title}</Flex>
      <AppButtonGroup {...rest} />
    </Flex>
  );
};

export const openActionsDialog = (
  props: Parameters<typeof ActionsDialog>[0]
) => {
  return openAppPopup(<ActionsDialog {...props} />);
};
