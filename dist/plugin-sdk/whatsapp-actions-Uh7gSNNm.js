import { i as resolveWhatsAppAccount } from "./accounts-BmD-AEBn.js";
import "./paths-DCNrSyZW.js";
import "./github-copilot-token-Df-R0zCM.js";
import "./config-gqKM2taf.js";
import "./subsystem-D7KkLxSJ.js";
import "./command-format-D4smYdZ1.js";
import "./agent-scope-CSmNmVhJ.js";
import "./message-channel-B_avrhM-.js";
import "./plugins-B7fJu_Ba.js";
import "./bindings-DP8YbHvd.js";
import "./path-alias-guards-CUFn_yTy.js";
import "./fs-safe-B80i-5ai.js";
import "./image-ops-C9f289yg.js";
import "./ssrf-Dw1X2jO2.js";
import "./fetch-guard-DwOl2_De.js";
import "./local-roots-BSxFXLP4.js";
import "./ir-CVH9RQJz.js";
import "./chunk-CG5IPiTb.js";
import "./markdown-tables-CTfa8lJO.js";
import "./render-BRr7caFG.js";
import "./tables-ClLCIQfT.js";
import "./tool-images-CQKcmAXz.js";
import { f as readReactionParams, h as readStringParam, i as ToolAuthorizationError, l as jsonResult, o as createActionGate } from "./target-errors-DYgJ1rxY.js";
import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-BRzjFmfG.js";
import { r as sendReactionWhatsApp } from "./outbound-Bb1d0Cql.js";

//#region src/agents/tools/whatsapp-target-auth.ts
function resolveAuthorizedWhatsAppOutboundTarget(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const resolution = resolveWhatsAppOutboundTarget({
		to: params.chatJid,
		allowFrom: account.allowFrom ?? [],
		mode: "implicit"
	});
	if (!resolution.ok) throw new ToolAuthorizationError(`WhatsApp ${params.actionLabel} blocked: chatJid "${params.chatJid}" is not in the configured allowFrom list for account "${account.accountId}".`);
	return {
		to: resolution.to,
		accountId: account.accountId
	};
}

//#endregion
//#region src/agents/tools/whatsapp-actions.ts
async function handleWhatsAppAction(params, cfg) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);
	if (action === "react") {
		if (!isActionEnabled("reactions")) throw new Error("WhatsApp reactions are disabled.");
		const chatJid = readStringParam(params, "chatJid", { required: true });
		const messageId = readStringParam(params, "messageId", { required: true });
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a WhatsApp reaction." });
		const participant = readStringParam(params, "participant");
		const accountId = readStringParam(params, "accountId");
		const fromMeRaw = params.fromMe;
		const fromMe = typeof fromMeRaw === "boolean" ? fromMeRaw : void 0;
		const resolved = resolveAuthorizedWhatsAppOutboundTarget({
			cfg,
			chatJid,
			accountId,
			actionLabel: "reaction"
		});
		const resolvedEmoji = remove ? "" : emoji;
		await sendReactionWhatsApp(resolved.to, messageId, resolvedEmoji, {
			verbose: false,
			fromMe,
			participant: participant ?? void 0,
			accountId: resolved.accountId
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	throw new Error(`Unsupported WhatsApp action: ${action}`);
}

//#endregion
export { handleWhatsAppAction };