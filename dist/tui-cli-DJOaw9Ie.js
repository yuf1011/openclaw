import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-BKDT474X.js";
import "./thinking-BB3zi8pq.js";
import "./agent-scope-DCKfYrWF.js";
import { f as defaultRuntime } from "./subsystem-DypCPrmP.js";
import "./openclaw-root-CFLIucxC.js";
import "./exec-DNET3cHX.js";
import "./model-selection-CY9xYYOZ.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-Wzu0-e0P.js";
import "./env-B5XQ5e-9.js";
import "./host-env-security-lcjXF83D.js";
import "./env-vars-DaAL-4up.js";
import "./manifest-registry-B-v_wlZg.js";
import "./dock-DhgkXccV.js";
import "./message-channel-CL7a-KXJ.js";
import "./pi-embedded-helpers-CMbFT3_G.js";
import "./sandbox-Djl8RUE1.js";
import "./tool-catalog-CrsxKKLj.js";
import "./chrome-DkqFU9Ph.js";
import "./tailscale-C-tOZDe1.js";
import "./tailnet-CRQOzSo2.js";
import "./ws-CssQjOC0.js";
import "./auth-WJGV7tsg.js";
import "./server-context-BAjXJi6n.js";
import "./frontmatter-CB8gEEQm.js";
import "./skills-BbmcSnJa.js";
import "./path-alias-guards-Dfp1U4rw.js";
import "./paths-DAklX9oy.js";
import "./redact-BE3UB6uj.js";
import "./errors-CrS5JXaQ.js";
import "./fs-safe-D0smsDjN.js";
import "./ssrf-Blm1XSFw.js";
import "./image-ops-DAepi46v.js";
import "./store-D23vKFSr.js";
import "./ports-CLRrK-Dy.js";
import "./trash-euUUqPqv.js";
import "./server-middleware-DfUXHrbc.js";
import "./sessions-BbGEJQV4.js";
import "./plugins-eSL0uuoJ.js";
import "./accounts-DQgQwXa3.js";
import "./accounts-EgfCFevR.js";
import "./accounts-vu1D9TQ9.js";
import "./bindings-CPdv76rH.js";
import "./logging-B-Pt-Wis.js";
import "./paths-BGNs16eo.js";
import "./chat-envelope-CgPWv96J.js";
import "./tool-images-BW07OwMQ.js";
import "./tool-display-Bcqsb3P4.js";
import "./commands-t30QI-_a.js";
import "./commands-registry-Dm1W51EC.js";
import "./client-BnjP2Efw.js";
import "./call-BBY2tyti.js";
import "./pairing-token-CLZagMwJ.js";
import { t as formatDocsLink } from "./links-6E2cEKvW.js";
import { t as parseTimeoutMs } from "./parse-timeout-4VifOcrr.js";
import { t as runTui } from "./tui-DYkdfoz2.js";

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