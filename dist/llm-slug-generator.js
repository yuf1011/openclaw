import { a as resolveAgentEffectiveModelPrimary, c as resolveDefaultAgentId, i as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-D5kzL9GE.js";
import "./paths-DPhYhCig.js";
import { t as createSubsystemLogger } from "./subsystem-A5aAh1zO.js";
import "./workspace-VcPVUCzw.js";
import { Fn as DEFAULT_MODEL, In as DEFAULT_PROVIDER, l as parseModelRef } from "./model-selection-yWp8posS.js";
import "./github-copilot-token-CWLBOI2T.js";
import "./env-Dmb9NI10.js";
import "./boolean-Ce2-qkSB.js";
import "./dock-C-y0y7OS.js";
import "./tokens-DgpN0YdO.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-YIjE4QBm.js";
import "./plugins-Dz1hFDl8.js";
import "./accounts-CXNvbdtQ.js";
import "./bindings-DewsrSnt.js";
import "./send-6psl6A_f.js";
import "./send-Dsh0f2_G.js";
import "./deliver-BtpzMRLI.js";
import "./diagnostic-Dzv7mq49.js";
import "./diagnostic-session-state-_tGY1a3B.js";
import "./accounts-DcvVxQDz.js";
import "./send-CZH-ag-p.js";
import "./image-ops-B6ZMNyBX.js";
import "./pi-model-discovery-B6aczUeh.js";
import "./message-channel-2ebD0aMr.js";
import "./pi-embedded-helpers-B8l33757.js";
import "./chrome-DjG03mUR.js";
import "./frontmatter-dL6nzqUu.js";
import "./skills-yPb4nmYd.js";
import "./path-alias-guards-DaEkqfaJ.js";
import "./redact-CCJhkLdQ.js";
import "./errors-Q-5Tp91z.js";
import "./fs-safe-0fsGlxpP.js";
import "./ssrf-BRBpjZ2I.js";
import "./store-r98xYrED.js";
import "./sessions-DAx9Ddcr.js";
import "./accounts-Cglgpp0d.js";
import "./paths-Dtwm9D9e.js";
import "./tool-images-yO8TPhIh.js";
import "./thinking-BcOnJa2q.js";
import "./image-D0B38ZwY.js";
import "./reply-prefix-DT6IpSHL.js";
import "./manager-PDDTeIxu.js";
import "./gemini-auth-CfGVrlye.js";
import "./fetch-guard-BMjoL4Vb.js";
import "./query-expansion-D91b-JYr.js";
import "./retry-C-ekRUnQ.js";
import "./target-errors-DvbBnNDX.js";
import "./local-roots-DgUuv1Ip.js";
import "./chunk-Do89kJEA.js";
import "./markdown-tables-B67Aue2p.js";
import "./ir-C7TsIucY.js";
import "./render-loap2gRq.js";
import "./commands-registry-FIdh2CyK.js";
import "./skill-commands-BmkFpkmq.js";
import "./runner-C8nyQ0rg.js";
import "./fetch-B1nZSYJF.js";
import "./channel-activity-WEu8L9_x.js";
import "./tables-CFCdLRWO.js";
import "./send-CcI4Qh43.js";
import "./outbound-attachment-4nQoZY0M.js";
import "./send-Cr9j1GEF.js";
import "./resolve-route-BtVHeSZi.js";
import "./proxy-BMa4czGu.js";
import "./replies-Q21rI1Jj.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
const log = createSubsystemLogger("llm-slug-generator");
/**
* Generate a short 1-2 word filename slug from session content using LLM
*/
async function generateSlugViaLLM(params) {
	let tempSessionFile = null;
	try {
		const agentId = resolveDefaultAgentId(params.cfg);
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		const agentDir = resolveAgentDir(params.cfg, agentId);
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-slug-"));
		tempSessionFile = path.join(tempDir, "session.jsonl");
		const prompt = `Based on this conversation, generate a short 1-2 word filename slug (lowercase, hyphen-separated, no file extension).

Conversation summary:
${params.sessionContent.slice(0, 2e3)}

Reply with ONLY the slug, nothing else. Examples: "vendor-pitch", "api-design", "bug-fix"`;
		const modelRef = resolveAgentEffectiveModelPrimary(params.cfg, agentId);
		const parsed = modelRef ? parseModelRef(modelRef, DEFAULT_PROVIDER) : null;
		const provider = parsed?.provider ?? DEFAULT_PROVIDER;
		const model = parsed?.model ?? DEFAULT_MODEL;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			provider,
			model,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		const message = err instanceof Error ? err.stack ?? err.message : String(err);
		log.error(`Failed to generate slug: ${message}`);
		return null;
	} finally {
		if (tempSessionFile) try {
			await fs.rm(path.dirname(tempSessionFile), {
				recursive: true,
				force: true
			});
		} catch {}
	}
}

//#endregion
export { generateSlugViaLLM };