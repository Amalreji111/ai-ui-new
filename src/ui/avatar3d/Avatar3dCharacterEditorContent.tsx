import { Avatar3dGltf } from "@mjtdev/avatar-3d";
import { Bytes, Dropzone, type ByteLike } from "@mjtdev/engine";
import { Flex } from "@radix-ui/themes";
import type { AppCharacter } from "ai-worker-common";
import { useEffect, useState } from "react";

export const Avatar3dCharacterEditorContent = ({
  value,
  onChange,
}: {
  character: AppCharacter;
  value: ByteLike | undefined;
  onChange: (value: ByteLike) => void;
}) => {
  const [state, setState] = useState({
    path: undefined as string | File | undefined,
  });
  useEffect(() => {
    if (!value) {
      return;
    }

    const blob = Bytes.toBlob(value, "model/gltf-binary");
    const file = new File([blob], "modal.glb");

    setState((s) => ({ ...s, path: file }));
  }, [value]);
  return (
    <Flex direction={"column"} gap={"2"}>
      <Dropzone
        iconSize="4em"
        iconCode="file_upload"
        inactiveText={`Add 3D model`}
        action={async (files: File[]): Promise<void> => {
          if (!files || files.length < 1) {
            return;
          }
          const ab = await files[0].arrayBuffer();
          const modelBinary = Bytes.toBlob(ab, "model/gltf-binary");
          onChange(modelBinary);
        }}
      />
      {state.path && (
        <>
          <Avatar3dGltf path={state.path} />
        </>
      )}
    </Flex>
  );
};
