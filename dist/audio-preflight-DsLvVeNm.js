import "./agent-scope-D5kzL9GE.js";
import "./paths-DPhYhCig.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-A5aAh1zO.js";
import "./workspace-VcPVUCzw.js";
import "./model-selection-yWp8posS.js";
import "./github-copilot-token-CWLBOI2T.js";
import "./env-Dmb9NI10.js";
import "./boolean-Ce2-qkSB.js";
import "./dock-C-y0y7OS.js";
import "./plugins-Dz1hFDl8.js";
import "./accounts-CXNvbdtQ.js";
import "./bindings-DewsrSnt.js";
import "./accounts-DcvVxQDz.js";
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
import "./gemini-auth-CfGVrlye.js";
import "./fetch-guard-BMjoL4Vb.js";
import "./local-roots-DgUuv1Ip.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-C8nyQ0rg.js";

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