import { s as resolveAgentWorkspaceDir } from "../../agent-scope-D5kzL9GE.js";
import { c as resolveStateDir } from "../../paths-DPhYhCig.js";
import { t as createSubsystemLogger } from "../../subsystem-A5aAh1zO.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-CPPWn8gW.js";
import "../../workspace-VcPVUCzw.js";
import "../../model-selection-yWp8posS.js";
import "../../github-copilot-token-CWLBOI2T.js";
import "../../env-Dmb9NI10.js";
import "../../boolean-Ce2-qkSB.js";
import "../../dock-C-y0y7OS.js";
import "../../tokens-DgpN0YdO.js";
import "../../pi-embedded-YIjE4QBm.js";
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
import { O as hasInterSessionUserProvenance } from "../../sessions-DAx9Ddcr.js";
import "../../accounts-Cglgpp0d.js";
import "../../paths-Dtwm9D9e.js";
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
import { generateSlugViaLLM } from "../../llm-slug-generator.js";
import { t as resolveHookConfig } from "../../config-B2xc8slk.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/bundled/session-memory/handler.ts
/**
* Session memory hook handler
*
* Saves session context to memory when /new or /reset command is triggered
* Creates a new dated memory file with LLM-generated slug
*/
const log = createSubsystemLogger("hooks/session-memory");
/**
* Read recent messages from session file for slug generation
*/
async function getRecentSessionContent(sessionFilePath, messageCount = 15) {
	try {
		const lines = (await fs.readFile(sessionFilePath, "utf-8")).trim().split("\n");
		const allMessages = [];
		for (const line of lines) try {
			const entry = JSON.parse(line);
			if (entry.type === "message" && entry.message) {
				const msg = entry.message;
				const role = msg.role;
				if ((role === "user" || role === "assistant") && msg.content) {
					if (role === "user" && hasInterSessionUserProvenance(msg)) continue;
					const text = Array.isArray(msg.content) ? msg.content.find((c) => c.type === "text")?.text : msg.content;
					if (text && !text.startsWith("/")) allMessages.push(`${role}: ${text}`);
				}
			}
		} catch {}
		return allMessages.slice(-messageCount).join("\n");
	} catch {
		return null;
	}
}
/**
* Try the active transcript first; if /new already rotated it,
* fallback to the latest .jsonl.reset.* sibling.
*/
async function getRecentSessionContentWithResetFallback(sessionFilePath, messageCount = 15) {
	const primary = await getRecentSessionContent(sessionFilePath, messageCount);
	if (primary) return primary;
	try {
		const dir = path.dirname(sessionFilePath);
		const resetPrefix = `${path.basename(sessionFilePath)}.reset.`;
		const resetCandidates = (await fs.readdir(dir)).filter((name) => name.startsWith(resetPrefix)).toSorted();
		if (resetCandidates.length === 0) return primary;
		const latestResetPath = path.join(dir, resetCandidates[resetCandidates.length - 1]);
		const fallback = await getRecentSessionContent(latestResetPath, messageCount);
		if (fallback) log.debug("Loaded session content from reset fallback", {
			sessionFilePath,
			latestResetPath
		});
		return fallback || primary;
	} catch {
		return primary;
	}
}
function stripResetSuffix(fileName) {
	const resetIndex = fileName.indexOf(".reset.");
	return resetIndex === -1 ? fileName : fileName.slice(0, resetIndex);
}
async function findPreviousSessionFile(params) {
	try {
		const files = await fs.readdir(params.sessionsDir);
		const fileSet = new Set(files);
		const baseFromReset = params.currentSessionFile ? stripResetSuffix(path.basename(params.currentSessionFile)) : void 0;
		if (baseFromReset && fileSet.has(baseFromReset)) return path.join(params.sessionsDir, baseFromReset);
		const trimmedSessionId = params.sessionId?.trim();
		if (trimmedSessionId) {
			const canonicalFile = `${trimmedSessionId}.jsonl`;
			if (fileSet.has(canonicalFile)) return path.join(params.sessionsDir, canonicalFile);
			const topicVariants = files.filter((name) => name.startsWith(`${trimmedSessionId}-topic-`) && name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
			if (topicVariants.length > 0) return path.join(params.sessionsDir, topicVariants[0]);
		}
		if (!params.currentSessionFile) return;
		const nonResetJsonl = files.filter((name) => name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
		if (nonResetJsonl.length > 0) return path.join(params.sessionsDir, nonResetJsonl[0]);
	} catch {}
}
/**
* Save session context to memory when /new or /reset command is triggered
*/
const saveSessionToMemory = async (event) => {
	const isResetCommand = event.action === "new" || event.action === "reset";
	if (event.type !== "command" || !isResetCommand) return;
	try {
		log.debug("Hook triggered for reset/new command", { action: event.action });
		const context = event.context || {};
		const cfg = context.cfg;
		const agentId = resolveAgentIdFromSessionKey(event.sessionKey);
		const workspaceDir = cfg ? resolveAgentWorkspaceDir(cfg, agentId) : path.join(resolveStateDir(process.env, os.homedir), "workspace");
		const memoryDir = path.join(workspaceDir, "memory");
		await fs.mkdir(memoryDir, { recursive: true });
		const now = new Date(event.timestamp);
		const dateStr = now.toISOString().split("T")[0];
		const sessionEntry = context.previousSessionEntry || context.sessionEntry || {};
		const currentSessionId = sessionEntry.sessionId;
		let currentSessionFile = sessionEntry.sessionFile || void 0;
		if (!currentSessionFile || currentSessionFile.includes(".reset.")) {
			const sessionsDirs = /* @__PURE__ */ new Set();
			if (currentSessionFile) sessionsDirs.add(path.dirname(currentSessionFile));
			sessionsDirs.add(path.join(workspaceDir, "sessions"));
			for (const sessionsDir of sessionsDirs) {
				const recoveredSessionFile = await findPreviousSessionFile({
					sessionsDir,
					currentSessionFile,
					sessionId: currentSessionId
				});
				if (!recoveredSessionFile) continue;
				currentSessionFile = recoveredSessionFile;
				log.debug("Found previous session file", { file: currentSessionFile });
				break;
			}
		}
		log.debug("Session context resolved", {
			sessionId: currentSessionId,
			sessionFile: currentSessionFile,
			hasCfg: Boolean(cfg)
		});
		const sessionFile = currentSessionFile || void 0;
		const hookConfig = resolveHookConfig(cfg, "session-memory");
		const messageCount = typeof hookConfig?.messages === "number" && hookConfig.messages > 0 ? hookConfig.messages : 15;
		let slug = null;
		let sessionContent = null;
		if (sessionFile) {
			sessionContent = await getRecentSessionContentWithResetFallback(sessionFile, messageCount);
			log.debug("Session content loaded", {
				length: sessionContent?.length ?? 0,
				messageCount
			});
			const allowLlmSlug = !(process.env.OPENCLAW_TEST_FAST === "1" || process.env.VITEST === "true" || process.env.VITEST === "1" || false) && hookConfig?.llmSlug !== false;
			if (sessionContent && cfg && allowLlmSlug) {
				log.debug("Calling generateSlugViaLLM...");
				slug = await generateSlugViaLLM({
					sessionContent,
					cfg
				});
				log.debug("Generated slug", { slug });
			}
		}
		if (!slug) {
			slug = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "").slice(0, 4);
			log.debug("Using fallback timestamp slug", { slug });
		}
		const filename = `${dateStr}-${slug}.md`;
		const memoryFilePath = path.join(memoryDir, filename);
		log.debug("Memory file path resolved", {
			filename,
			path: memoryFilePath.replace(os.homedir(), "~")
		});
		const timeStr = now.toISOString().split("T")[1].split(".")[0];
		const sessionId = sessionEntry.sessionId || "unknown";
		const source = context.commandSource || "unknown";
		const entryParts = [
			`# Session: ${dateStr} ${timeStr} UTC`,
			"",
			`- **Session Key**: ${event.sessionKey}`,
			`- **Session ID**: ${sessionId}`,
			`- **Source**: ${source}`,
			""
		];
		if (sessionContent) entryParts.push("## Conversation Summary", "", sessionContent, "");
		const entry = entryParts.join("\n");
		await fs.writeFile(memoryFilePath, entry, "utf-8");
		log.debug("Memory file written successfully");
		const relPath = memoryFilePath.replace(os.homedir(), "~");
		log.info(`Session context saved to ${relPath}`);
	} catch (err) {
		if (err instanceof Error) log.error("Failed to save session memory", {
			errorName: err.name,
			errorMessage: err.message,
			stack: err.stack
		});
		else log.error("Failed to save session memory", { error: String(err) });
	}
};

//#endregion
export { saveSessionToMemory as default };