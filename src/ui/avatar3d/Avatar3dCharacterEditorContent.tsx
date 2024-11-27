import { Avatar3d } from "@mjtdev/avatar-3d";
import { Flex } from "@radix-ui/themes";
import type { AppCharacter } from "ai-worker-common";
import { FormInputDisplay } from "../form/FormInputDisplay";

export const Avatar3dCharacterEditorContent = ({
  modelUrlValue,
  animationUrlValue,
  onChangeModelUrl,
  onChangeAnimationUrl,
}: {
  character: AppCharacter;
  modelUrlValue: string | undefined;
  animationUrlValue: string | undefined;
  onChangeModelUrl: (value: string) => void;
  onChangeAnimationUrl: (value: string) => void;
}) => {
  return (
    <Flex direction={"column"} gap={"2"}>
      <FormInputDisplay
        title={"3D Model URL"}
        style={{ width: "80ch" }}
        defaultValue={modelUrlValue}
        onChange={onChangeModelUrl}
      />
      <FormInputDisplay
        title={"Starting Animation URL"}
        style={{ width: "80ch" }}
        defaultValue={animationUrlValue}
        onChange={onChangeAnimationUrl}
      />
      {modelUrlValue && (
        <>
          <Avatar3d
            path={modelUrlValue}
            animationPath={animationUrlValue}
            vrmCameraOptions={{
              frustumSize: 1,
              position: { x: 0, y: 1.7, z: 3 },
              lookAt: { x: 0, y: 1.7, z: 0 },
            }}
          />
        </>
      )}
    </Flex>
  );
};
