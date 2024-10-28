import { Avatar3dGltf } from "@mjtdev/avatar-3d";
import { Flex } from "@radix-ui/themes";
import type { AppCharacter } from "ai-worker-common";
import { FormInputDisplay } from "../form/FormInputDisplay";

export const Avatar3dCharacterEditorContent = ({
  value,
  onChange,
}: {
  character: AppCharacter;
  value: string | undefined;
  onChange: (value: string) => void;
}) => {
  return (
    <Flex direction={"column"} gap={"2"}>
      <FormInputDisplay
        title={"3D Model URL"}
        style={{ width: "80ch" }}
        value={value}
        onChange={onChange}
      />
      {value && (
        <>
          <Avatar3dGltf path={value} />
        </>
      )}
    </Flex>
  );
};
