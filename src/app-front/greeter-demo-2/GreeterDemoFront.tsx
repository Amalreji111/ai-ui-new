import { useEffect } from "react";
import { AiplComponentProvider } from "../../provider/AiplComponentProvider";
import { hideLoadingScreen } from "../../ui/hideLoadingScreen";
import GreeterDemo from "./GreeterDemo";
import { greeterDemoConfig } from "./greeterDemoConfig";
import { Theme } from "@radix-ui/themes";

export const CircularGreeterDemoFront = () => {
  useEffect(() => {
    hideLoadingScreen();
  }, []);

  return (
    <AiplComponentProvider config={greeterDemoConfig}>
      <Theme>

      <GreeterDemo />
      </Theme>
    </AiplComponentProvider>
  );
};
