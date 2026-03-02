import "./exec-DtAnKlnZ.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./prompt-style-BZr96Wob.js";
import "./note-DVRsi_b1.js";
import { n as gatewayInstallErrorHint, t as buildGatewayInstallPlan } from "./daemon-install-helpers-CbdxeoLg.js";
import "./runtime-guard-Bxkrgx8-.js";
import { r as isGatewayDaemonRuntime, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-C9W4Cc6I.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-BnVNVk7J.js";
import { t as resolveGatewayService } from "./service-B11aFvIY.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-D0b0fbno.js";

//#region src/commands/onboard-non-interactive/local/daemon-install.ts
async function installGatewayDaemonNonInteractive(params) {
	const { opts, runtime, port, gatewayToken } = params;
	if (!opts.installDaemon) return;
	const daemonRuntimeRaw = opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) {
		runtime.log("Systemd user services are unavailable; skipping service install.");
		return;
	}
	if (!isGatewayDaemonRuntime(daemonRuntimeRaw)) {
		runtime.error("Invalid --daemon-runtime (use node or bun)");
		runtime.exit(1);
		return;
	}
	const service = resolveGatewayService();
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		token: gatewayToken,
		runtime: daemonRuntimeRaw,
		warn: (message) => runtime.log(message),
		config: params.nextConfig
	});
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		runtime.error(`Gateway service install failed: ${String(err)}`);
		runtime.log(gatewayInstallErrorHint());
		return;
	}
	await ensureSystemdUserLingerNonInteractive({ runtime });
}

//#endregion
export { installGatewayDaemonNonInteractive };