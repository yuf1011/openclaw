import { Ot as theme } from "./entry.js";
import "./auth-profiles-Dcaw_pRh.js";
import "./agent-scope-wyaXMjZL.js";
import "./openclaw-root-BlnoStgN.js";
import "./exec-DtAnKlnZ.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./manifest-registry-CgvV3cyf.js";
import { t as formatDocsLink } from "./links-C8KzbyCM.js";
import { n as registerQrCli } from "./qr-cli-D1T1C--i.js";

//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}

//#endregion
export { registerClawbotCli };