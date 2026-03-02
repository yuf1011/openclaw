import { s as createSubsystemLogger } from "./entry.js";
import { j as loadConfig } from "./auth-profiles-Dcaw_pRh.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-wyaXMjZL.js";
import "./openclaw-root-BlnoStgN.js";
import "./exec-DtAnKlnZ.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./manifest-registry-CgvV3cyf.js";
import "./dock-0IVUql9P.js";
import "./model-vydB19V0.js";
import "./pi-model-discovery-D02SmS2n.js";
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
import "./send-Bzos9HcH.js";
import "./send-NoIhko1q.js";
import { _ as loadOpenClawPlugins } from "./subagent-registry-BXwMeJTd.js";
import "./paths-4nKmwJd-.js";
import "./chat-envelope-BHg8VU61.js";
import "./client-e1hu3brc.js";
import "./call-BnTnEvsX.js";
import "./pairing-token-PHk3tBUz.js";
import "./net-DxQ7jfWx.js";
import "./tailnet-BweqFeik.js";
import "./tokens-CS2RLh2Y.js";
import "./with-timeout-_gngF2ZE.js";
import "./deliver-istSoKbl.js";
import "./diagnostic-DLXyejut.js";
import "./diagnostic-session-state-Cw3EMvZy.js";
import "./send-C8SmSVHF.js";
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
import "./models-config-Cgq90zgz.js";
import "./exec-approvals-allowlist-r5aN0rSf.js";
import "./exec-safe-bin-runtime-policy-pPXLAbSq.js";
import "./reply-prefix-CNvJg5p7.js";
import "./memory-cli-DUZJ2TmR.js";
import "./manager-wiZK_UV8.js";
import "./gemini-auth-BtP3VfuA.js";
import "./fetch-guard-EjRTJCGi.js";
import "./query-expansion-B3FVYwN6.js";
import "./retry-DRMxSLyf.js";
import "./target-errors-Rucfmui6.js";
import "./local-roots-pl0FzjFE.js";
import "./chunk-C1ApS_WL.js";
import "./markdown-tables-9hmq3cbW.js";
import "./ir-CL9TY3cb.js";
import "./render-C1H8wE-4.js";
import "./commands-CmSWGWiQ.js";
import "./commands-registry-EMo1Vdif.js";
import "./image-6SSDwk2x.js";
import "./tool-display-DvjkoW7B.js";
import "./runner-DccglkFK.js";
import "./model-catalog-YGBrWSuE.js";
import "./fetch-CgA7FwwB.js";
import "./pairing-store-BHRzoV8b.js";
import "./exec-approvals-DJC4eXS0.js";
import "./nodes-screen-Bj6kfGns.js";
import "./system-run-command-CjpZYUik.js";
import "./session-utils-BcVoGDzb.js";
import "./session-cost-usage-DMaYB8od.js";
import "./skill-commands-CeEd_Cn1.js";
import "./workspace-dirs-5ItWmTkH.js";
import "./channel-activity-CmnAG-Z9.js";
import "./tables-BRwwtNmT.js";
import "./server-lifecycle-CE1qQQGC.js";
import "./stagger-DAKdJbmK.js";
import "./channel-selection-CedR92bh.js";
import "./plugin-auto-enable-DwncvyQv.js";
import "./send-CDTX9DAo.js";
import "./outbound-attachment-BXMq5PWw.js";
import "./delivery-queue-CtdsWtrK.js";
import "./send-CgrAV6Oc.js";
import "./resolve-route-vQsCV3en.js";
import "./pi-tools.policy-snzCSkSF.js";
import "./proxy-4ph5c1qS.js";
import "./links-C8KzbyCM.js";
import "./cli-utils-lehxsosf.js";
import "./help-format-CQtXw6X8.js";
import "./progress-CbbocNs7.js";
import "./replies-DJXE-bMa.js";
import "./onboard-helpers-BDYpA07u.js";
import "./prompt-style-BZr96Wob.js";
import "./pairing-labels-Bcgi6l_m.js";

//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}

//#endregion
export { registerPluginCliCommands };