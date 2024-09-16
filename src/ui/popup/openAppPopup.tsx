import { Dialog, Flex, IconButton } from "@radix-ui/themes";
import type { CSSProperties, ReactNode } from "react";
import { updateAppPopupState } from "./AppPopupState";
import { closeAppPopup } from "./closeAppPopup";
import { IoClose } from "react-icons/io5";

export const openAppPopup = (
  node: ReactNode,
  options: Partial<{
    onClose: () => void;
    size: "1" | "2" | "3" | "4";
    style: CSSProperties;
  }> = {}
) => {
  const { onClose = () => {}, size = "1", style = {} } = options;
  updateAppPopupState((s) => {
    const contentsLength = s.popupContents.push(
      <Dialog.Root
        key={"app-popup-" + crypto.randomUUID()}
        onOpenChange={(open) => {
          if (!open) {
            updateAppPopupState((s) => {
              delete s.popupContents[contentsLength - 1];
            });
            onClose();
          }
        }}
        defaultOpen={true}
      >
        <Dialog.Content
          onInteractOutside={(evt) => evt.preventDefault()}
          size={size}
          style={{
            maxWidth: "fit-content",
            position: "relative",
            // backgroundColor: "red",
            ...style,
          }}
          onKeyUp={(evt) => {
            if (evt.key === "Escape") {
              closeAppPopup();
            }
          }}
        >
          <IconButton
            onClick={() => {
              closeAppPopup();
            }}
            size={"2"}
            variant="outline"
            style={{
              // backgroundColor: "var(--color-panel-solid)",
              // borderRadius: "50%",
              position: "absolute",
              right: "0.1ch",
              top: "0.1em",
              // zIndex: 1,
            }}
          >
            <IoClose />
          </IconButton>
          <Flex align={"center"} direction={"column"}>
            {node}
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    );
  });
};
