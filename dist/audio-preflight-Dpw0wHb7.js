import { Ct as shouldLogVerbose, bt as logVerbose } from "./entry.js";
import "./auth-profiles-Dcaw_pRh.js";
import "./agent-scope-wyaXMjZL.js";
import "./openclaw-root-BlnoStgN.js";
import "./exec-DtAnKlnZ.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-BM8ktVlo.js";
import "./version-DuoLwnUX.js";
import "./env-vars-kURZgejA.js";
import "./manifest-registry-CgvV3cyf.js";
import "./dock-0IVUql9P.js";
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
import "./paths-4nKmwJd-.js";
import "./chat-envelope-BHg8VU61.js";
import "./net-DxQ7jfWx.js";
import "./tailnet-BweqFeik.js";
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
import "./gemini-auth-BtP3VfuA.js";
import "./fetch-guard-EjRTJCGi.js";
import "./local-roots-pl0FzjFE.js";
import "./image-6SSDwk2x.js";
import "./tool-display-DvjkoW7B.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-DccglkFK.js";
import "./model-catalog-YGBrWSuE.js";

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