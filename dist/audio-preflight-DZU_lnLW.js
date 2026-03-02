import "./agent-scope-WPEQNa7s.js";
import "./paths-DpzIdlnz.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-BOPdQ1OK.js";
import "./model-selection-_wwsB-Rp.js";
import "./github-copilot-token-DqKkG5Fl.js";
import "./env-BX6x1hV4.js";
import "./dock-D9l1pXyr.js";
import "./plugins-CjbbSxCN.js";
import "./accounts-B2ahhojb.js";
import "./bindings-CJkxcyp4.js";
import "./accounts-DBEv71q9.js";
import "./image-ops-C1iBuQIF.js";
import "./pi-model-discovery-Crprj13d.js";
import "./message-channel-D4WVx_pi.js";
import "./pi-embedded-helpers-DiDQQOip.js";
import "./chrome-zHt8reui.js";
import "./skills-BsOMsmQz.js";
import "./path-alias-guards-BlHtvYYg.js";
import "./redact-B4SyoUg5.js";
import "./errors-BAHEXskC.js";
import "./fs-safe-DV72UMzC.js";
import "./ssrf-2rqeONok.js";
import "./store-F5VIdgXV.js";
import "./sessions-CLlG9ZBE.js";
import "./accounts-Bf390mA3.js";
import "./paths-B_vwhpwb.js";
import "./tool-images-B9cNfCI4.js";
import "./thinking-xBL_QUje.js";
import "./image-BY3S31pV.js";
import "./gemini-auth-DW0mMqHe.js";
import "./fetch-guard-D_bR_XNs.js";
import "./local-roots-CPS40G-E.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-C-6KW3wI.js";

//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	const audioConfig = cfg.tools?.media?.audio;
	if (!audioConfig || audioConfig.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	const providerRegistry = buildProviderRegistry(params.providers);
	const cache = createMediaAttachmentCache(attachments, { localPathRoots: resolveMediaAttachmentLocalRoots({
		cfg,
		ctx
	}) });
	try {
		const result = await runCapability({
			capability: "audio",
			cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config: audioConfig,
			activeModel: params.activeModel
		});
		if (!result || result.outputs.length === 0) return;
		const audioOutput = result.outputs.find((output) => output.kind === "audio.transcription");
		if (!audioOutput || !audioOutput.text) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${audioOutput.text.length} chars from attachment ${firstAudio.index}`);
		return audioOutput.text;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	} finally {
		await cache.cleanup();
	}
}

//#endregion
export { transcribeFirstAudio };