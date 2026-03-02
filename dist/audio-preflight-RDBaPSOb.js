import "./paths-B4BZAPZh.js";
import { F as shouldLogVerbose, M as logVerbose } from "./utils-BKDT474X.js";
import "./thinking-BB3zi8pq.js";
import "./agent-scope-DCKfYrWF.js";
import "./subsystem-DypCPrmP.js";
import "./openclaw-root-CFLIucxC.js";
import "./exec-DNET3cHX.js";
import "./model-selection-CY9xYYOZ.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-Wzu0-e0P.js";
import "./env-B5XQ5e-9.js";
import "./host-env-security-lcjXF83D.js";
import "./env-vars-DaAL-4up.js";
import "./manifest-registry-B-v_wlZg.js";
import "./dock-DhgkXccV.js";
import "./message-channel-CL7a-KXJ.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-BnEcTnos.js";
import "./image-BPAKShRs.js";
import "./models-config-BFdii3Yb.js";
import "./pi-model-discovery-CI4yKRoY.js";
import "./pi-embedded-helpers-CMbFT3_G.js";
import "./sandbox-Djl8RUE1.js";
import "./tool-catalog-CrsxKKLj.js";
import "./chrome-DkqFU9Ph.js";
import "./tailscale-C-tOZDe1.js";
import "./tailnet-CRQOzSo2.js";
import "./ws-CssQjOC0.js";
import "./auth-WJGV7tsg.js";
import "./server-context-BAjXJi6n.js";
import "./frontmatter-CB8gEEQm.js";
import "./skills-BbmcSnJa.js";
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
import "./server-middleware-DfUXHrbc.js";
import "./sessions-BbGEJQV4.js";
import "./plugins-eSL0uuoJ.js";
import "./accounts-DQgQwXa3.js";
import "./accounts-EgfCFevR.js";
import "./accounts-vu1D9TQ9.js";
import "./bindings-CPdv76rH.js";
import "./logging-B-Pt-Wis.js";
import "./paths-BGNs16eo.js";
import "./chat-envelope-CgPWv96J.js";
import "./tool-images-BW07OwMQ.js";
import "./tool-display-Bcqsb3P4.js";
import "./fetch-guard-CUGsu7kv.js";
import "./api-key-rotation-DPLhG1M8.js";
import "./local-roots-DjTWf9ug.js";
import "./model-catalog-CNekAzNx.js";

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