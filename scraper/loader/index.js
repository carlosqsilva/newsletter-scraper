import { registerHooks } from "node:module";
import { load } from "./ts-loader.js";

registerHooks({ load });
