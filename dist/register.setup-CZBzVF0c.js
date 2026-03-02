import "./paths-B4BZAPZh.js";
import { B as theme, S as shortenHomePath } from "./utils-BKDT474X.js";
import { E as ensureAgentWorkspace, _ as DEFAULT_AGENT_WORKSPACE_DIR } from "./agent-scope-DCKfYrWF.js";
import { f as defaultRuntime } from "./subsystem-DypCPrmP.js";
import "./openclaw-root-CFLIucxC.js";
import "./exec-DNET3cHX.js";
import { Bt as createConfigIO, qt as writeConfigFile } from "./model-selection-CY9xYYOZ.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-Wzu0-e0P.js";
import "./env-B5XQ5e-9.js";
import "./host-env-security-lcjXF83D.js";
import "./env-vars-DaAL-4up.js";
import "./manifest-registry-B-v_wlZg.js";
import "./dock-DhgkXccV.js";
import "./message-channel-CL7a-KXJ.js";
import "./tailnet-CRQOzSo2.js";
import "./ws-CssQjOC0.js";
import "./redact-BE3UB6uj.js";
import "./errors-CrS5JXaQ.js";
import "./sessions-BbGEJQV4.js";
import "./plugins-eSL0uuoJ.js";
import "./accounts-DQgQwXa3.js";
import "./accounts-EgfCFevR.js";
import "./accounts-vu1D9TQ9.js";
import "./bindings-CPdv76rH.js";
import "./logging-B-Pt-Wis.js";
import { s as resolveSessionTranscriptsDir } from "./paths-BGNs16eo.js";
import "./chat-envelope-CgPWv96J.js";
import "./client-BnjP2Efw.js";
import "./call-BBY2tyti.js";
import "./pairing-token-CLZagMwJ.js";
import { t as formatDocsLink } from "./links-6E2cEKvW.js";
import { n as runCommandWithRuntime } from "./cli-utils-aSBNHQae.js";
import "./progress-DZWqZ1es.js";
import "./onboard-helpers-B0LiyFGq.js";
import "./prompt-style-CQUEv9Gp.js";
import "./runtime-guard-DHGnrIqj.js";
import { t as hasExplicitOptions } from "./command-options-D1vpSf2D.js";
import "./note-DhiNzslk.js";
import "./clack-prompter-DTI-QJ5t.js";
import "./onboarding-B8RpvlNM.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-BPYlagf2.js";
import { t as onboardCommand } from "./onboard-GyiBF4BC.js";
import JSON5 from "json5";
import fs from "node:fs/promises";

//#region src/commands/setup.ts
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fs.readFile(configPath, "utf-8");
		const parsed = JSON5.parse(raw);
		if (parsed && typeof parsed === "object") return {
			exists: true,
			parsed
		};
		return {
			exists: true,
			parsed: {}
		};
	} catch {
		return {
			exists: false,
			parsed: {}
		};
	}
}
async function setupCommand(opts, runtime = defaultRuntime) {
	const desiredWorkspace = typeof opts?.workspace === "string" && opts.workspace.trim() ? opts.workspace.trim() : void 0;
	const configPath = createConfigIO().configPath;
	const existingRaw = await readConfigFileRaw(configPath);
	const cfg = existingRaw.parsed;
	const defaults = cfg.agents?.defaults ?? {};
	const workspace = desiredWorkspace ?? defaults.workspace ?? DEFAULT_AGENT_WORKSPACE_DIR;
	const next = {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				workspace
			}
		}
	};
	if (!existingRaw.exists || defaults.workspace !== workspace) {
		await writeConfigFile(next);
		if (!existingRaw.exists) runtime.log(`Wrote ${formatConfigPath(configPath)}`);
		else logConfigUpdated(runtime, {
			path: configPath,
			suffix: "(set agents.defaults.workspace)"
		});
	} else runtime.log(`Config OK: ${formatConfigPath(configPath)}`);
	const ws = await ensureAgentWorkspace({
		dir: workspace,
		ensureBootstrapFiles: !next.agents?.defaults?.skipBootstrap
	});
	runtime.log(`Workspace OK: ${shortenHomePath(ws.dir)}`);
	const sessionsDir = resolveSessionTranscriptsDir();
	await fs.mkdir(sessionsDir, { recursive: true });
	runtime.log(`Sessions OK: ${shortenHomePath(sessionsDir)}`);
}

//#endregion
//#region src/cli/program/register.setup.ts
function registerSetupCommand(program) {
	program.command("setup").description("Initialize ~/.openclaw/openclaw.json and the agent workspace").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.openclaw.ai/cli/setup")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)").option("--wizard", "Run the interactive onboarding wizard", false).option("--non-interactive", "Run the wizard without prompts", false).option("--mode <mode>", "Wizard mode: local|remote").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasWizardFlags = hasExplicitOptions(command, [
				"wizard",
				"nonInteractive",
				"mode",
				"remoteUrl",
				"remoteToken"
			]);
			if (opts.wizard || hasWizardFlags) {
				await onboardCommand({
					workspace: opts.workspace,
					nonInteractive: Boolean(opts.nonInteractive),
					mode: opts.mode,
					remoteUrl: opts.remoteUrl,
					remoteToken: opts.remoteToken
				}, defaultRuntime);
				return;
			}
			await setupCommand({ workspace: opts.workspace }, defaultRuntime);
		});
	});
}

//#endregion
export { registerSetupCommand };