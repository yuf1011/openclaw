import { s as createSubsystemLogger } from "./entry.js";
import { j as loadConfig } from "./auth-profiles-Dcaw_pRh.js";
import "./agent-scope-wyaXMjZL.js";
import "./openclaw-root-BlnoStgN.js";
import "./exec-DtAnKlnZ.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./manifest-registry-CgvV3cyf.js";
import "./path-alias-guards-C-yObGN5.js";
import "./net-DxQ7jfWx.js";
import "./tailnet-BweqFeik.js";
import "./image-ops-BQUn6wym.js";
import "./chrome-C0o6OwfT.js";
import "./tailscale-R5nsrkpg.js";
import "./auth-BKjNhyMQ.js";
import { c as resolveBrowserControlAuth, i as resolveBrowserConfig, r as registerBrowserRoutes, s as ensureBrowserControlAuth, t as createBrowserRouteContext } from "./server-context-BTjcJGC5.js";
import "./paths-DmaSOFYG.js";
import "./redact-Dcypez3H.js";
import "./errors-Cu3BYw29.js";
import "./fs-safe-DH0vl0b6.js";
import "./ssrf-CUvqCfry.js";
import "./store-CcPn9dc7.js";
import "./ports-BSBaTdIY.js";
import "./trash-fHYSOM8_.js";
import { n as installBrowserCommonMiddleware, t as installBrowserAuthMiddleware } from "./server-middleware-Ch7nAV3-.js";
import { n as stopKnownBrowserProfiles, t as ensureExtensionRelayForProfiles } from "./server-lifecycle-CE1qQQGC.js";
import { t as isPwAiLoaded } from "./tool-loop-detection-JcWdTdfW.js";
import express from "express";

//#region src/browser/server.ts
let state = null;
const logServer = createSubsystemLogger("browser").child("server");
async function startBrowserControlServerFromConfig() {
	if (state) return state;
	const cfg = loadConfig();
	const resolved = resolveBrowserConfig(cfg.browser, cfg);
	if (!resolved.enabled) return null;
	let browserAuth = resolveBrowserControlAuth(cfg);
	let browserAuthBootstrapFailed = false;
	try {
		const ensured = await ensureBrowserControlAuth({ cfg });
		browserAuth = ensured.auth;
		if (ensured.generatedToken) logServer.info("No browser auth configured; generated gateway.auth.token automatically.");
	} catch (err) {
		logServer.warn(`failed to auto-configure browser auth: ${String(err)}`);
		browserAuthBootstrapFailed = true;
	}
	if (browserAuthBootstrapFailed && !browserAuth.token && !browserAuth.password) {
		logServer.error("browser control startup aborted: authentication bootstrap failed and no fallback auth is configured.");
		return null;
	}
	const app = express();
	installBrowserCommonMiddleware(app);
	installBrowserAuthMiddleware(app, browserAuth);
	registerBrowserRoutes(app, createBrowserRouteContext({
		getState: () => state,
		refreshConfigFromDisk: true
	}));
	const port = resolved.controlPort;
	const server = await new Promise((resolve, reject) => {
		const s = app.listen(port, "127.0.0.1", () => resolve(s));
		s.once("error", reject);
	}).catch((err) => {
		logServer.error(`openclaw browser server failed to bind 127.0.0.1:${port}: ${String(err)}`);
		return null;
	});
	if (!server) return null;
	state = {
		server,
		port,
		resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	await ensureExtensionRelayForProfiles({
		resolved,
		onWarn: (message) => logServer.warn(message)
	});
	const authMode = browserAuth.token ? "token" : browserAuth.password ? "password" : "off";
	logServer.info(`Browser control listening on http://127.0.0.1:${port}/ (auth=${authMode})`);
	return state;
}
async function stopBrowserControlServer() {
	const current = state;
	if (!current) return;
	await stopKnownBrowserProfiles({
		getState: () => state,
		onWarn: (message) => logServer.warn(message)
	});
	if (current.server) await new Promise((resolve) => {
		current.server?.close(() => resolve());
	});
	state = null;
	if (isPwAiLoaded()) try {
		await (await import("./pw-ai-KiHr3NOJ.js")).closePlaywrightBrowserConnection();
	} catch {}
}

//#endregion
export { startBrowserControlServerFromConfig, stopBrowserControlServer };