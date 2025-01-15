import { useEffect } from "react";
import { AiplComponentProvider } from "../../provider/AiplComponentProvider";
import { hideLoadingScreen } from "../../ui/hideLoadingScreen";
import GreeterDemo from "./GreeterDemo";
import { greeterDemoConfig } from "./greeterDemoConfig";
import { Theme } from "@radix-ui/themes";
import GreeterDemo2 from "./GreeterDemo2";

export const BettyDemoFront = () => {
  useEffect(() => {
    hideLoadingScreen();
  }, []);

  return (
    <AiplComponentProvider config={greeterDemoConfig}>
      <Theme>

      <GreeterDemo2 />
      </Theme>
    </AiplComponentProvider>
  );
};
