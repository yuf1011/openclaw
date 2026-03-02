import type { Api, Model } from "@mariozechner/pi-ai";
import type { ModelRegistry } from "@mariozechner/pi-coding-agent";
export declare const ANTIGRAVITY_OPUS_46_FORWARD_COMPAT_CANDIDATES: readonly [{
    readonly id: "claude-opus-4-6-thinking";
    readonly templatePrefixes: readonly ["google-antigravity/claude-opus-4-5-thinking", "google-antigravity/claude-opus-4.5-thinking"];
}, {
    readonly id: "claude-opus-4-6";
    readonly templatePrefixes: readonly ["google-antigravity/claude-opus-4-5", "google-antigravity/claude-opus-4.5"];
}];
export declare const COPILOT_1M_FORWARD_COMPAT_CANDIDATES: readonly [{
    readonly key: "github-copilot/claude-opus-4-6-1m";
    readonly templatePrefixes: readonly ["github-copilot/claude-opus-4-6", "github-copilot/claude-opus-4.6"];
}, {
    readonly key: "github-copilot/claude-opus-4.6-1m";
    readonly templatePrefixes: readonly ["github-copilot/claude-opus-4.6", "github-copilot/claude-opus-4-6"];
}];
export declare const COPILOT_FAST_FORWARD_COMPAT_CANDIDATES: readonly [{
    readonly key: "github-copilot/claude-opus-4-6-fast";
    readonly templatePrefixes: readonly ["github-copilot/claude-opus-4-6", "github-copilot/claude-opus-4.6"];
}, {
    readonly key: "github-copilot/claude-opus-4.6-fast";
    readonly templatePrefixes: readonly ["github-copilot/claude-opus-4.6", "github-copilot/claude-opus-4-6"];
}];
export declare function resolveForwardCompatModel(provider: string, modelId: string, modelRegistry: ModelRegistry): Model<Api> | undefined;
