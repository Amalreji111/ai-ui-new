import { isUndefined } from "@mjtdev/engine";
import { Button, Tooltip, type ButtonProps } from "@radix-ui/themes";
import type { ReactNode } from "react";

export const AppButton = ({
  children,
  tooltip,
  ...rest
}: {
  tooltip?: NonNullable<ReactNode>;
} & ButtonProps) => {
  if (isUndefined(tooltip)) {
    return <Button {...rest}>{children}</Button>;
  }
  return (
    <Tooltip
      delayDuration={500}
      disableHoverableContent={true}
      style={{ pointerEvents: "none" }}
      content={tooltip}
    >
      <Button {...rest}>{children}</Button>
    </Tooltip>
  );
};
