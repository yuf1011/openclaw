import { n as listAgentIds, s as resolveAgentWorkspaceDir } from "../../agent-scope-D5kzL9GE.js";
import "../../paths-DPhYhCig.js";
import { pt as isGatewayStartupEvent, r as defaultRuntime, t as createSubsystemLogger } from "../../subsystem-A5aAh1zO.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-CPPWn8gW.js";
import "../../workspace-VcPVUCzw.js";
import "../../model-selection-yWp8posS.js";
import "../../github-copilot-token-CWLBOI2T.js";
import "../../env-Dmb9NI10.js";
import "../../boolean-Ce2-qkSB.js";
import "../../dock-C-y0y7OS.js";
import { n as SILENT_REPLY_TOKEN } from "../../tokens-DgpN0YdO.js";
import { a as createDefaultDeps, i as agentCommand } from "../../pi-embedded-YIjE4QBm.js";
import "../../plugins-Dz1hFDl8.js";
import "../../accounts-CXNvbdtQ.js";
import "../../bindings-DewsrSnt.js";
import "../../send-6psl6A_f.js";
import "../../send-Dsh0f2_G.js";
import "../../deliver-BtpzMRLI.js";
import "../../diagnostic-Dzv7mq49.js";
import "../../diagnostic-session-state-_tGY1a3B.js";
import "../../accounts-DcvVxQDz.js";
import "../../send-CZH-ag-p.js";
import "../../image-ops-B6ZMNyBX.js";
import "../../pi-model-discovery-B6aczUeh.js";
import "../../message-channel-2ebD0aMr.js";
import "../../pi-embedded-helpers-B8l33757.js";
import "../../chrome-DjG03mUR.js";
import "../../frontmatter-dL6nzqUu.js";
import "../../skills-yPb4nmYd.js";
import "../../path-alias-guards-DaEkqfaJ.js";
import "../../redact-CCJhkLdQ.js";
import "../../errors-Q-5Tp91z.js";
import "../../fs-safe-0fsGlxpP.js";
import "../../ssrf-BRBpjZ2I.js";
import "../../store-r98xYrED.js";
import { H as resolveAgentMainSessionKey, W as resolveMainSessionKey, d as updateSessionStore, s as loadSessionStore } from "../../sessions-DAx9Ddcr.js";
import "../../accounts-Cglgpp0d.js";
import { l as resolveStorePath } from "../../paths-Dtwm9D9e.js";
import "../../tool-images-yO8TPhIh.js";
import "../../thinking-BcOnJa2q.js";
import "../../image-D0B38ZwY.js";
import "../../reply-prefix-DT6IpSHL.js";
import "../../manager-PDDTeIxu.js";
import "../../gemini-auth-CfGVrlye.js";
import "../../fetch-guard-BMjoL4Vb.js";
import "../../query-expansion-D91b-JYr.js";
import "../../retry-C-ekRUnQ.js";
import "../../target-errors-DvbBnNDX.js";
import "../../local-roots-DgUuv1Ip.js";
import "../../chunk-Do89kJEA.js";
import "../../markdown-tables-B67Aue2p.js";
import "../../ir-C7TsIucY.js";
import "../../render-loap2gRq.js";
import "../../commands-registry-FIdh2CyK.js";
import "../../skill-commands-BmkFpkmq.js";
import "../../runner-C8nyQ0rg.js";
import "../../fetch-B1nZSYJF.js";
import "../../channel-activity-WEu8L9_x.js";
import "../../tables-CFCdLRWO.js";
import "../../send-CcI4Qh43.js";
import "../../outbound-attachment-4nQoZY0M.js";
import "../../send-Cr9j1GEF.js";
import "../../resolve-route-BtVHeSZi.js";
import "../../proxy-BMa4czGu.js";
import "../../replies-Q21rI1Jj.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

//#region src/gateway/boot.ts
function generateBootSessionId() {
	return `boot-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "")}-${crypto.randomUUID().slice(0, 8)}`;
}
const log$1 = createSubsystemLogger("gateway/boot");
const BOOT_FILENAME = "BOOT.md";
function buildBootPrompt(content) {
	return [
		"You are running a boot check. Follow BOOT.md instructions exactly.",
		"",
		"BOOT.md:",
		content,
		"",
		"If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).",
		"Use the `target` field (not `to`) for message tool destinations.",
		`After sending with the message tool, reply with ONLY: ${SILENT_REPLY_TOKEN}.`,
		`If nothing needs attention, reply with ONLY: ${SILENT_REPLY_TOKEN}.`
	].join("\n");
}
async function loadBootFile(workspaceDir) {
	const bootPath = path.join(workspaceDir, BOOT_FILENAME);
	try {
		const trimmed = (await fs.readFile(bootPath, "utf-8")).trim();
		if (!trimmed) return { status: "empty" };
		return {
			status: "ok",
			content: trimmed
		};
	} catch (err) {
		if (err.code === "ENOENT") return { status: "missing" };
		throw err;
	}
}
function snapshotMainSessionMapping(params) {
	const agentId = resolveAgentIdFromSessionKey(params.sessionKey);
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId });
	try {
		const entry = loadSessionStore(storePath, { skipCache: true })[params.sessionKey];
		if (!entry) return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: true,
			hadEntry: false
		};
		return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: true,
			hadEntry: true,
			entry: structuredClone(entry)
		};
	} catch (err) {
		log$1.debug("boot: could not snapshot main session mapping", {
			sessionKey: params.sessionKey,
			error: String(err)
		});
		return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: false,
			hadEntry: false
		};
	}
}
async function restoreMainSessionMapping(snapshot) {
	if (!snapshot.canRestore) return;
	try {
		await updateSessionStore(snapshot.storePath, (store) => {
			if (snapshot.hadEntry && snapshot.entry) {
				store[snapshot.sessionKey] = snapshot.entry;
				return;
			}
			delete store[snapshot.sessionKey];
		}, { activeSessionKey: snapshot.sessionKey });
		return;
	} catch (err) {
		return err instanceof Error ? err.message : String(err);
	}
}
async function runBootOnce(params) {
	const bootRuntime = {
		log: () => {},
		error: (message) => log$1.error(String(message)),
		exit: defaultRuntime.exit
	};
	let result;
	try {
		result = await loadBootFile(params.workspaceDir);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log$1.error(`boot: failed to read ${BOOT_FILENAME}: ${message}`);
		return {
			status: "failed",
			reason: message
		};
	}
	if (result.status === "missing" || result.status === "empty") return {
		status: "skipped",
		reason: result.status
	};
	const sessionKey = params.agentId ? resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	}) : resolveMainSessionKey(params.cfg);
	const message = buildBootPrompt(result.content ?? "");
	const sessionId = generateBootSessionId();
	const mappingSnapshot = snapshotMainSessionMapping({
		cfg: params.cfg,
		sessionKey
	});
	let agentFailure;
	try {
		await agentCommand({
			message,
			sessionKey,
			sessionId,
			deliver: false,
			senderIsOwner: true
		}, bootRuntime, params.deps);
	} catch (err) {
		agentFailure = err instanceof Error ? err.message : String(err);
		log$1.error(`boot: agent run failed: ${agentFailure}`);
	}
	const mappingRestoreFailure = await restoreMainSessionMapping(mappingSnapshot);
	if (mappingRestoreFailure) log$1.error(`boot: failed to restore main session mapping: ${mappingRestoreFailure}`);
	if (!agentFailure && !mappingRestoreFailure) return { status: "ran" };
	return {
		status: "failed",
		reason: [agentFailure ? `agent run failed: ${agentFailure}` : void 0, mappingRestoreFailure ? `mapping restore failed: ${mappingRestoreFailure}` : void 0].filter((part) => Boolean(part)).join("; ")
	};
}

//#endregion
//#region src/hooks/bundled/boot-md/handler.ts
const log = createSubsystemLogger("hooks/boot-md");
const runBootChecklist = async (event) => {
	if (!isGatewayStartupEvent(event)) return;
	if (!event.context.cfg) return;
	const cfg = event.context.cfg;
	const deps = event.context.deps ?? createDefaultDeps();
	const agentIds = listAgentIds(cfg);
	for (const agentId of agentIds) {
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const result = await runBootOnce({
			cfg,
			deps,
			workspaceDir,
			agentId
		});
		if (result.status === "failed") {
			log.warn("boot-md failed for agent startup run", {
				agentId,
				workspaceDir,
				reason: result.reason
			});
			continue;
		}
		if (result.status === "skipped") log.debug("boot-md skipped for agent startup run", {
			agentId,
			workspaceDir,
			reason: result.reason
		});
	}
};

//#endregion
export { runBootChecklist as default };