import "./accounts-BmD-AEBn.js";
import "./paths-DCNrSyZW.js";
import "./github-copilot-token-Df-R0zCM.js";
import "./config-gqKM2taf.js";
import { $ as logVerbose, nt as shouldLogVerbose } from "./subsystem-D7KkLxSJ.js";
import "./command-format-D4smYdZ1.js";
import "./agent-scope-CSmNmVhJ.js";
import "./dock-CdMuYZO5.js";
import "./message-channel-B_avrhM-.js";
import "./sessions-CbMWbIAO.js";
import "./plugins-B7fJu_Ba.js";
import "./accounts-BPtv-PJR.js";
import "./accounts-Dhh810UH.js";
import "./bindings-DP8YbHvd.js";
import "./paths-DmIeQHA5.js";
import "./redact-C1cyUA71.js";
import "./errors--NHuiZti.js";
import "./path-alias-guards-CUFn_yTy.js";
import "./fs-safe-B80i-5ai.js";
import "./image-ops-C9f289yg.js";
import "./ssrf-Dw1X2jO2.js";
import "./fetch-guard-DwOl2_De.js";
import "./local-roots-BSxFXLP4.js";
import "./tool-images-CQKcmAXz.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-BKCJqgz7.js";
import "./skills-BhB4NpM2.js";
import "./chrome-BrL3rp-v.js";
import "./store-DCsZovHa.js";
import "./pi-embedded-helpers-BCL_eyxp.js";
import "./thinking-Du2pRwSM.js";
import "./image-BfbVg4mg.js";
import "./pi-model-discovery-DiUpN3Hi.js";
import "./api-key-rotation-CovDb_et.js";

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