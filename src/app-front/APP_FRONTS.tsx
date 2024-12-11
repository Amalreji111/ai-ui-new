import type { ReactChild } from "react";
import { OverlaySpa } from "../ui/overlay/OverlaySpa";
import { PlaygroundSpa } from "../ui/playground/PlaygroundSpa";
import { PowerUserSpa } from "../ui/Spa";
import { PizzaDemoFront } from "./pizza-demo/PizzaDemoFront";
import { GreeterDemoFront } from "./xmas-greeter/GreeterDemoFront";
import { AiUiScreen } from "./ai-ui-chat/GreeterDemoFront";

export const APP_FRONTS: Record<string, ReactChild> = {
  "power-user": <PowerUserSpa />,
  playground: <PlaygroundSpa />,
  overlay: <OverlaySpa />,
  "pizza-demo": <PizzaDemoFront />,
  "xmas-demo":<GreeterDemoFront />,
  "ai-ui-chat":<AiUiScreen/>
} as const;
