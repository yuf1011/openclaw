import { Ot as theme, v as defaultRuntime } from "./entry.js";
import "./auth-profiles-Dcaw_pRh.js";
import "./agent-scope-wyaXMjZL.js";
import "./openclaw-root-BlnoStgN.js";
import "./exec-DtAnKlnZ.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./manifest-registry-CgvV3cyf.js";
import "./dock-0IVUql9P.js";
import "./frontmatter-Cj9cX5l1.js";
import "./skills-BzU66Osv.js";
import "./path-alias-guards-C-yObGN5.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-CaYHTPpt.js";
import "./plugins-CQDL2vOs.js";
import "./accounts-CfWBMYAb.js";
import "./accounts-2nvk2raz.js";
import "./accounts-hhB2kf08.js";
import "./bindings-D-EPGOte.js";
import "./logging-CFvkxgcX.js";
import "./paths-4nKmwJd-.js";
import "./chat-envelope-BHg8VU61.js";
import "./client-e1hu3brc.js";
import "./call-BnTnEvsX.js";
import "./pairing-token-PHk3tBUz.js";
import "./net-DxQ7jfWx.js";
import "./tailnet-BweqFeik.js";
import "./image-ops-BQUn6wym.js";
import "./pi-embedded-helpers-Bs8EJBaL.js";
import "./sandbox-D2iibWvS.js";
import "./tool-catalog-DABanDxl.js";
import "./chrome-C0o6OwfT.js";
import "./tailscale-R5nsrkpg.js";
import "./auth-BKjNhyMQ.js";
import "./server-context-BTjcJGC5.js";
import "./paths-DmaSOFYG.js";
import "./redact-Dcypez3H.js";
import "./errors-Cu3BYw29.js";
import "./fs-safe-DH0vl0b6.js";
import "./ssrf-CUvqCfry.js";
import "./store-CcPn9dc7.js";
import "./ports-BSBaTdIY.js";
import "./trash-fHYSOM8_.js";
import "./server-middleware-Ch7nAV3-.js";
import "./tool-images-k2VE6qUU.js";
import "./thinking-W-ZROVDm.js";
import "./commands-CmSWGWiQ.js";
import "./commands-registry-EMo1Vdif.js";
import "./tool-display-DvjkoW7B.js";
import { t as parseTimeoutMs } from "./parse-timeout-U3P8xqXu.js";
import { t as formatDocsLink } from "./links-C8KzbyCM.js";
import { t as runTui } from "./tui-B241Ef-D.js";

//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerTuiCli };