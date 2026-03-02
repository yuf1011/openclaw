import "./paths-B4BZAPZh.js";
import "./utils-BKDT474X.js";
import "./subsystem-DypCPrmP.js";
import "./exec-DNET3cHX.js";
import "./host-env-security-lcjXF83D.js";
import "./env-vars-DaAL-4up.js";
import "./prompt-style-CQUEv9Gp.js";
import "./runtime-guard-DHGnrIqj.js";
import "./note-DhiNzslk.js";
import { n as gatewayInstallErrorHint, t as buildGatewayInstallPlan } from "./daemon-install-helpers-BBc7oO6u.js";
import { r as isGatewayDaemonRuntime, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-DG_wSD1u.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-Z3XjsKXS.js";
import { t as resolveGatewayService } from "./service-B1e9io1y.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-D5mb4kUE.js";

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