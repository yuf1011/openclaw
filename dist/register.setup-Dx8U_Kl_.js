import { Ot as theme, ut as shortenHomePath, v as defaultRuntime } from "./entry.js";
import { A as createConfigIO, L as writeConfigFile } from "./auth-profiles-Dcaw_pRh.js";
import { E as ensureAgentWorkspace, _ as DEFAULT_AGENT_WORKSPACE_DIR } from "./agent-scope-wyaXMjZL.js";
import "./openclaw-root-BlnoStgN.js";
import "./exec-DtAnKlnZ.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./manifest-registry-CgvV3cyf.js";
import "./dock-0IVUql9P.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-CaYHTPpt.js";
import "./plugins-CQDL2vOs.js";
import "./accounts-CfWBMYAb.js";
import "./accounts-2nvk2raz.js";
import "./accounts-hhB2kf08.js";
import "./bindings-D-EPGOte.js";
import "./logging-CFvkxgcX.js";
import { s as resolveSessionTranscriptsDir } from "./paths-4nKmwJd-.js";
import "./chat-envelope-BHg8VU61.js";
import "./client-e1hu3brc.js";
import "./call-BnTnEvsX.js";
import "./pairing-token-PHk3tBUz.js";
import "./net-DxQ7jfWx.js";
import "./tailnet-BweqFeik.js";
import "./redact-Dcypez3H.js";
import "./errors-Cu3BYw29.js";
import { t as formatDocsLink } from "./links-C8KzbyCM.js";
import { n as runCommandWithRuntime } from "./cli-utils-lehxsosf.js";
import "./progress-CbbocNs7.js";
import "./onboard-helpers-BDYpA07u.js";
import "./prompt-style-BZr96Wob.js";
import { t as hasExplicitOptions } from "./command-options-BkTXKWlb.js";
import "./note-DVRsi_b1.js";
import "./clack-prompter-BHH70N-4.js";
import "./runtime-guard-Bxkrgx8-.js";
import "./onboarding-DXISQYsP.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-Bi2fXy2a.js";
import { t as onboardCommand } from "./onboard-CHhp_US0.js";
import JSON5 from "json5";
import fsPromises from "node:fs/promises";

//#region src/commands/setup.ts
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fsPromises.readFile(configPath, "utf-8");
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
	await fsPromises.mkdir(sessionsDir, { recursive: true });
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