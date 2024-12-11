import type { ReactChild } from "react";
import { OverlaySpa } from "../ui/overlay/OverlaySpa";
import { PlaygroundSpa } from "../ui/playground/PlaygroundSpa";
import { PowerUserSpa } from "../ui/Spa";
import { PizzaDemoFront } from "./pizza-demo/PizzaDemoFront";
import { AiUiScreen } from "./ai-ui-chat/GreeterDemoFront";
import { BettyDemoFront } from "./betty-greeter/GreeterDemoFront";

export const APP_FRONTS: Record<string, ReactChild> = {
  "power-user": <PowerUserSpa />,
  playground: <PlaygroundSpa />,
  overlay: <OverlaySpa />,
  "pizza-demo": <PizzaDemoFront />,
  "betty-demo":<BettyDemoFront />,
  "ai-ui-chat":<AiUiScreen/>
} as const;
