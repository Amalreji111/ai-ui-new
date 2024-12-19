import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { version } from "./package.json"; // Import version from package.json

export default defineConfig({
  build: {
    // sourcemap: true,
    sourcemap: false,
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],

    },
    target: "es2022",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        pizza: resolve(__dirname, "pizza.html"),
      },
    },
  },
  optimizeDeps: {
    include: ['linked-dep',' node_modules/@mediapipe/*'],
  },
  base: "",
  css: {
    modules: {
      scopeBehaviour: "local",
    },
  },
  plugins: [react()],
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __APP_VERSION__: JSON.stringify(version),
    __SHORT_IO_KEY__:JSON.stringify('sk_X5G2rj0PnQSi6yYX'),
    __SHORT_IO_DOMAIN__:JSON.stringify('link.intelligage.io'),
    __SIMLI_API_KEY__:JSON.stringify('16nybpxejyst74vd2c9kd'),
    __SIMLI_FACE_ID__:JSON.stringify("e4b0ecec-6af1-4cd6-a870-ad490d0a6270"),
    __R2_BUCKET_ASSET_URL__:JSON.stringify('https://pub-95dde801fe1848caab87217ee3dc1307.r2.dev'),
    // Local dev settings
    // __HOME_BASE__: JSON.stringify("http://localhost:8787"),
    // __PAP_ID__: JSON.stringify(
    //   "access-point-1725394696984-a760a179-851e-48d0-b276-85e7a426239c"
    // ),
    // Local dev power-user settings
    // __HOME_BASE__: JSON.stringify("http://localhost:8787"),
    // __PAP_ID__: undefined,
    // __APP_FRONT__: JSON.stringify("power-user"),

    // Production pizza demo settings
    // // __PAP_ID__: JSON.stringify(
    // //   "access-point-1725394696984-a760a179-851e-48d0-b276-85e7a426239c"
    // // ),
    // __PAP_ID__: undefined,
    // __APP_FRONT__: JSON.stringify("power-user"),
 // AI-UI Dev settings
 // __HOME_BASE__: JSON.stringify("https://ai-worker.mjtdev.workers.dev"),
 // __PAP_ID__: JSON.stringify(
 //   "access-point-1725571260862-23455f95-1253-4dfe-96e3-952ac6af647c"
 // ),

//currently used betty pap
 __PAP_ID__:JSON.stringify("access-point-1731369542080-9e8d483a-2613-482c-b726-2b7f2ec3b1be"),

 //XMAS -pap
//  __PAP_ID__:JSON.stringify("access-point-1732810105505-839046aa-cfba-4236-a863-7895cbf41ebf"),
 // __APP_FRONT__: JSON.stringify("pizza-demo"),
 //Greeter project config
 // __PAP_ID__:JSON.stringify("access-point-1730138425212-a96c9489-58c9-42ba-9cb4-a85e230bb408"),
 // __PAP_ID__:JSON.stringify("access-point-1729798916406-965d156a-2242-44af-9a4a-7e38de595a1f"),
 // __APP_FRONT__: JSON.stringify("ai-ui-chat"),
 //FOR XMAS DEMO
 __APP_FRONT__: JSON.stringify("circular-greeter"),
 //BETTY DEMO
//  __APP_FRONT__: JSON.stringify("betty-demo"),
    // AI-UI Production settings
    // __HOME_BASE__: JSON.stringify("https://ai-workforce.intelligage.net"),
    __HOME_BASE__: JSON.stringify("https://ai-worker.intelligage.workers.dev"),
    // __PAP_ID__: JSON.stringify(
    //   "access-point-1725571260862-23455f95-1253-4dfe-96e3-952ac6af647c"
    // ),

    // AI-Workfroce Production settings
    // __HOME_BASE__: JSON.stringify("https://ai-worker.intelligage.workers.dev"),
    // __PAP_ID__: undefined,
    // __APP_FRONT__: JSON.stringify("power-user"),
  },
});
