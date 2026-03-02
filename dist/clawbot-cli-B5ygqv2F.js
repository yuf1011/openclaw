import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-BKDT474X.js";
import "./agent-scope-DCKfYrWF.js";
import "./subsystem-DypCPrmP.js";
import "./openclaw-root-CFLIucxC.js";
import "./exec-DNET3cHX.js";
import "./model-selection-CY9xYYOZ.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-Wzu0-e0P.js";
import "./env-B5XQ5e-9.js";
import "./host-env-security-lcjXF83D.js";
import "./env-vars-DaAL-4up.js";
import "./manifest-registry-B-v_wlZg.js";
import { t as formatDocsLink } from "./links-6E2cEKvW.js";
import { n as registerQrCli } from "./qr-cli-DmqsUIAQ.js";

//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}

//#endregion
export { registerClawbotCli };