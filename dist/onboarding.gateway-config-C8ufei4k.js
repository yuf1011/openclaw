import { hn as ensureControlUiAllowedOriginsForNonLoopbackBind } from "./auth-profiles-Dcaw_pRh.js";
import "./agent-scope-wyaXMjZL.js";
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
import "./paths-4nKmwJd-.js";
import "./chat-envelope-BHg8VU61.js";
import "./client-e1hu3brc.js";
import "./call-BnTnEvsX.js";
import "./pairing-token-PHk3tBUz.js";
import "./net-DxQ7jfWx.js";
import "./tailnet-BweqFeik.js";
import { a as findTailscaleBinary } from "./tailscale-R5nsrkpg.js";
import { h as randomToken, u as normalizeGatewayTokenInput, y as validateGatewayPasswordInput } from "./onboard-helpers-BDYpA07u.js";
import "./prompt-style-BZr96Wob.js";
import { a as maybeAddTailnetOriginToControlUiAllowedOrigins, i as TAILSCALE_MISSING_BIN_NOTE_LINES, n as TAILSCALE_DOCS_LINES, r as TAILSCALE_EXPOSURE_OPTIONS, t as validateIPv4AddressInput } from "./ipv4-BSPfhyDX.js";

//#region src/wizard/onboarding.gateway-config.ts
const DEFAULT_DANGEROUS_NODE_DENY_COMMANDS = [
	"camera.snap",
	"camera.clip",
	"screen.record",
	"calendar.add",
	"contacts.add",
	"reminders.add"
];
async function configureGatewayForOnboarding(opts) {
	const { flow, localPort, quickstartGateway, prompter } = opts;
	let { nextConfig } = opts;
	const port = flow === "quickstart" ? quickstartGateway.port : Number.parseInt(String(await prompter.text({
		message: "Gateway port",
		initialValue: String(localPort),
		validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
	})), 10);
	let bind = flow === "quickstart" ? quickstartGateway.bind : await prompter.select({
		message: "Gateway bind",
		options: [
			{
				value: "loopback",
				label: "Loopback (127.0.0.1)"
			},
			{
				value: "lan",
				label: "LAN (0.0.0.0)"
			},
			{
				value: "tailnet",
				label: "Tailnet (Tailscale IP)"
			},
			{
				value: "auto",
				label: "Auto (Loopback → LAN)"
			},
			{
				value: "custom",
				label: "Custom IP"
			}
		]
	});
	let customBindHost = quickstartGateway.customBindHost;
	if (bind === "custom") {
		if (flow !== "quickstart" || !customBindHost) {
			const input = await prompter.text({
				message: "Custom IP address",
				placeholder: "192.168.1.100",
				initialValue: customBindHost ?? "",
				validate: validateIPv4AddressInput
			});
			customBindHost = typeof input === "string" ? input.trim() : void 0;
		}
	}
	let authMode = flow === "quickstart" ? quickstartGateway.authMode : await prompter.select({
		message: "Gateway auth",
		options: [{
			value: "token",
			label: "Token",
			hint: "Recommended default (local + remote)"
		}, {
			value: "password",
			label: "Password"
		}],
		initialValue: "token"
	});
	const tailscaleMode = flow === "quickstart" ? quickstartGateway.tailscaleMode : await prompter.select({
		message: "Tailscale exposure",
		options: [...TAILSCALE_EXPOSURE_OPTIONS]
	});
	let tailscaleBin = null;
	if (tailscaleMode !== "off") {
		tailscaleBin = await findTailscaleBinary();
		if (!tailscaleBin) await prompter.note(TAILSCALE_MISSING_BIN_NOTE_LINES.join("\n"), "Tailscale Warning");
	}
	let tailscaleResetOnExit = flow === "quickstart" ? quickstartGateway.tailscaleResetOnExit : false;
	if (tailscaleMode !== "off" && flow !== "quickstart") {
		await prompter.note(TAILSCALE_DOCS_LINES.join("\n"), "Tailscale");
		tailscaleResetOnExit = Boolean(await prompter.confirm({
			message: "Reset Tailscale serve/funnel on exit?",
			initialValue: false
		}));
	}
	if (tailscaleMode !== "off" && bind !== "loopback") {
		await prompter.note("Tailscale requires bind=loopback. Adjusting bind to loopback.", "Note");
		bind = "loopback";
		customBindHost = void 0;
	}
	if (tailscaleMode === "funnel" && authMode !== "password") {
		await prompter.note("Tailscale funnel requires password auth.", "Note");
		authMode = "password";
	}
	let gatewayToken;
	if (authMode === "token") if (flow === "quickstart") gatewayToken = (quickstartGateway.token ?? normalizeGatewayTokenInput(process.env.OPENCLAW_GATEWAY_TOKEN)) || randomToken();
	else gatewayToken = normalizeGatewayTokenInput(await prompter.text({
		message: "Gateway token (blank to generate)",
		placeholder: "Needed for multi-machine or non-loopback access",
		initialValue: quickstartGateway.token ?? normalizeGatewayTokenInput(process.env.OPENCLAW_GATEWAY_TOKEN) ?? ""
	})) || randomToken();
	if (authMode === "password") {
		const password = flow === "quickstart" && quickstartGateway.password ? quickstartGateway.password : await prompter.text({
			message: "Gateway password",
			validate: validateGatewayPasswordInput
		});
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "password",
					password: String(password ?? "").trim()
				}
			}
		};
	} else if (authMode === "token") nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			auth: {
				...nextConfig.gateway?.auth,
				mode: "token",
				token: gatewayToken
			}
		}
	};
	nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			port,
			bind,
			...bind === "custom" && customBindHost ? { customBindHost } : {},
			tailscale: {
				...nextConfig.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	nextConfig = ensureControlUiAllowedOriginsForNonLoopbackBind(nextConfig, { requireControlUiEnabled: true }).config;
	nextConfig = await maybeAddTailnetOriginToControlUiAllowedOrigins({
		config: nextConfig,
		tailscaleMode,
		tailscaleBin
	});
	if (!quickstartGateway.hasExisting && nextConfig.gateway?.nodes?.denyCommands === void 0 && nextConfig.gateway?.nodes?.allowCommands === void 0 && nextConfig.gateway?.nodes?.browser === void 0) nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			nodes: {
				...nextConfig.gateway?.nodes,
				denyCommands: [...DEFAULT_DANGEROUS_NODE_DENY_COMMANDS]
			}
		}
	};
	return {
		nextConfig,
		settings: {
			port,
			bind,
			customBindHost: bind === "custom" ? customBindHost : void 0,
			authMode,
			gatewayToken,
			tailscaleMode,
			tailscaleResetOnExit
		}
	};
}

//#endregion
export { configureGatewayForOnboarding };