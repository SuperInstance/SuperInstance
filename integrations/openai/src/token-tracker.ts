// ─── Token Tracker ───────────────────────────────────────────────────────────
//
// Converts OpenAI token usage to SuperInstance γ/η metrics.
//
// Conversion formulas:
//   γ = prompt_tokens / 10000           — coordination cost scales with input
//   η = min(completion_tokens / 5000, C × 0.8)  — value capped below C
//   Failed tasks: η = 0, γ still counts
//
// Where C = log₂(3) ≈ 1.585 bits — the conservation capacity constant.
//

/** C = log₂(3) ≈ 1.585 — conservation capacity constant */
const C = Math.log2(3);

/** Cumulative token usage and derived metrics */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  gammaTotal: number;
  etaTotal: number;
}

/**
 * TokenTracker — converts OpenAI token usage to γ/η conservation metrics.
 *
 * @example
 * ```typescript
 * const tracker = new TokenTracker();
 * const gamma = tracker.tokensToGamma(5000, 1200);
 * const eta = tracker.outputToEta("Built it!", true);
 * ```
 */
export class TokenTracker {
  private promptTokens: number = 0;
  private completionTokens: number = 0;
  private gammaTotal: number = 0;
  private etaTotal: number = 0;

  /**
   * Convert tokens used to γ (coordination cost).
   *
   * γ scales linearly with prompt tokens — more input means more
   * coordination overhead invested in the task.
   *
   * Formula: γ = prompt_tokens / 10000
   */
  tokensToGamma(promptTokens: number, completionTokens: number): number {
    // γ is driven by prompt size (coordination input cost)
    return promptTokens / 10000;
  }

  /**
   * Convert task output to η (value produced).
   *
   * η scales with completion tokens but is capped below C to ensure
   * the conservation law γ + η ≤ C can always hold.
   *
   * Formula: η = min(completion_tokens / 5000, C × 0.8)
   * Failed tasks: η = 0
   */
  outputToEta(output: string, success: boolean): number {
    if (!success) return 0;

    // Estimate completion tokens from output length (~4 chars/token)
    const estimatedTokens = output.length / 4;
    const cap = C * 0.8; // ≈ 1.268
    return Math.min(estimatedTokens / 5000, cap);
  }

  /**
   * Record a task's token usage and derive γ/η.
   * Returns the computed { gamma, eta } pair.
   */
  recordTask(promptTokens: number, completionTokens: number, success: boolean): { gamma: number; eta: number } {
    const gamma = this.tokensToGamma(promptTokens, completionTokens);
    const eta = success
      ? Math.min(completionTokens / 5000, C * 0.8)
      : 0;

    this.promptTokens += promptTokens;
    this.completionTokens += completionTokens;
    this.gammaTotal += gamma;
    this.etaTotal += eta;

    return { gamma, eta };
  }

  /**
   * Record from a raw output string (estimates tokens from length).
   */
  recordFromOutput(taskLength: number, output: string, success: boolean): { gamma: number; eta: number } {
    const estPrompt = Math.ceil(taskLength / 4);
    const estCompletion = Math.ceil(output.length / 4);
    return this.recordTask(estPrompt, estCompletion, success);
  }

  /**
   * Get cumulative usage across all recorded tasks.
   */
  getCumulative(): TokenUsage {
    return {
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      gammaTotal: this.gammaTotal,
      etaTotal: this.etaTotal,
    };
  }

  /**
   * Check whether adding the given γ/η would violate conservation.
   */
  wouldViolate(gamma: number, eta: number): boolean {
    return this.gammaTotal + gamma + this.etaTotal + eta > C;
  }

  /** Reset all trackers */
  reset(): void {
    this.promptTokens = 0;
    this.completionTokens = 0;
    this.gammaTotal = 0;
    this.etaTotal = 0;
  }
}
