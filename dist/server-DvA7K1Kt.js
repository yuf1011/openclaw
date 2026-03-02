import "./paths-B4BZAPZh.js";
import "./utils-BKDT474X.js";
import "./agent-scope-DCKfYrWF.js";
import { t as createSubsystemLogger } from "./subsystem-DypCPrmP.js";
import "./openclaw-root-CFLIucxC.js";
import "./exec-DNET3cHX.js";
import { Vt as loadConfig } from "./model-selection-CY9xYYOZ.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-Wzu0-e0P.js";
import "./env-B5XQ5e-9.js";
import "./host-env-security-lcjXF83D.js";
import "./env-vars-DaAL-4up.js";
import "./manifest-registry-B-v_wlZg.js";
import "./chrome-DkqFU9Ph.js";
import "./tailscale-C-tOZDe1.js";
import "./tailnet-CRQOzSo2.js";
import "./ws-CssQjOC0.js";
import "./auth-WJGV7tsg.js";
import { c as resolveBrowserControlAuth, i as resolveBrowserConfig, r as registerBrowserRoutes, s as ensureBrowserControlAuth, t as createBrowserRouteContext } from "./server-context-BAjXJi6n.js";
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
import { n as installBrowserCommonMiddleware, t as installBrowserAuthMiddleware } from "./server-middleware-DfUXHrbc.js";
import { n as stopKnownBrowserProfiles, t as ensureExtensionRelayForProfiles } from "./server-lifecycle-z9XpGD6M.js";
import { t as isPwAiLoaded } from "./tool-loop-detection-B1_rZFTj.js";
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
		await (await import("./pw-ai-BVncsJyu.js")).closePlaywrightBrowserConnection();
	} catch {}
}

//#endregion
export { startBrowserControlServerFromConfig, stopBrowserControlServer };