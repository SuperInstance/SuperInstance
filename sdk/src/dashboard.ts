// ─── SuperInstance Fleet Dashboard ───────────────────────────────────────────
//
// A live terminal UI showing fleet conservation status.
// Zero runtime dependencies — uses only Node.js built-in modules.
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
//

import type { Fleet } from './sdk.js';
import type { FleetStatus, ConservationState, GovernorDecision } from './types.js';

// ─── ANSI Escape Codes ───────────────────────────────────────────────────────

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightCyan: '\x1b[96m',
  // Cursor
  hide: '\x1b[?25l',
  show: '\x1b[?25h',
  home: '\x1b[H',
  clearScreen: '\x1b[2J',
  clearLine: '\x1b[2K',
} as const;

// ─── Box Drawing Characters ──────────────────────────────────────────────────

const BOX = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  teeDown: '╠',
  teeUp: '╣',
  teeRight: '╟',
  teeLeft: '╢',
  innerTopLeft: '┌',
  innerTopRight: '┐',
  innerBottomLeft: '└',
  innerBottomRight: '┘',
  innerHorizontal: '─',
  innerVertical: '│',
} as const;

// ─── Status Configuration ────────────────────────────────────────────────────

interface StatusConfig {
  icon: string;
  label: string;
  color: string;
}

function statusConfig(status: ConservationState['status']): StatusConfig {
  switch (status) {
    case 'healthy':
      return { icon: '✅', label: 'HEALTHY', color: ANSI.green };
    case 'monitor':
      return { icon: '⚠️', label: 'MONITOR', color: ANSI.yellow };
    case 'tight':
      return { icon: '🔶', label: 'TIGHT', color: ANSI.brightYellow };
    case 'violated':
      return { icon: '❌', label: 'VIOLATED', color: ANSI.red };
  }
}

function governorColor(action: GovernorDecision['action']): string {
  switch (action) {
    case 'release':
    case 'spawn':
      return ANSI.green;
    case 'hold':
      return ANSI.cyan;
    case 'throttle':
      return ANSI.yellow;
    case 'merge':
      return ANSI.magenta;
    default:
      return ANSI.white;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a progress bar from a ratio (0..1) and width */
function progressBar(ratio: number, width: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  const filled = Math.round(clamped * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/** Format uptime in human-readable form */
function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

/** Pad or truncate a string to exact width */
function pad(str: string, width: number): string {
  if (str.length > width) return str.slice(0, width);
  return str + ' '.repeat(width - str.length);
}

/** Center a string within a width */
function center(str: string, width: number): string {
  const total = width - str.length;
  if (total <= 0) return str;
  const left = Math.floor(total / 2);
  const right = total - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

/** Get color for a ratio based on proximity to limit */
function ratioColor(ratio: number): string {
  if (ratio < 0.5) return ANSI.green;
  if (ratio < 0.75) return ANSI.yellow;
  return ANSI.red;
}

// ─── Dashboard Options ───────────────────────────────────────────────────────

export interface DashboardOptions {
  /** Refresh interval in milliseconds (default 1000) */
  refreshMs?: number;
}

// ─── FleetDashboard ──────────────────────────────────────────────────────────

/**
 * FleetDashboard — a live terminal UI for fleet conservation status.
 *
 * Renders an auto-updating dashboard showing:
 * - Conservation status (γ, η, δ)
 * - Progress bars for budget usage
 * - Agent table with per-agent γ/budget/phase
 * - Governor decision and recommendations
 * - Uptime and tick counter
 *
 * @example
 * ```typescript
 * const fleet = new Fleet({ name: 'my-fleet' });
 * fleet.spawn({ role: 'builder', gammaBudget: 0.35 });
 * const dash = new FleetDashboard(fleet, { refreshMs: 500 });
 * dash.start();
 * ```
 */
export class FleetDashboard {
  private readonly fleet: Fleet;
  private readonly refreshMs: number;
  private interval: ReturnType<typeof setInterval> | null = null;
  private tick: number = 0;
  private readonly startTime: number;
  private stdinListener: ((data: Buffer) => void) | null = null;
  private sigintListener: (() => void) | null = null;
  private running: boolean = false;

  constructor(fleet: Fleet, options?: DashboardOptions) {
    this.fleet = fleet;
    this.refreshMs = options?.refreshMs ?? 1000;
    this.startTime = Date.now();
  }

  /**
   * Start the dashboard — takes over the terminal.
   * Press 'q' or Ctrl-C to exit.
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    // Enter raw mode for keypress detection
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf-8');
    }

    // Hide cursor, clear screen
    process.stdout.write(ANSI.hide + ANSI.clearScreen + ANSI.home);

    // Render immediately
    this.render();

    // Start refresh interval
    this.interval = setInterval(() => this.render(), this.refreshMs);

    // Handle keyboard input
    this.stdinListener = (data: Buffer | string): void => {
      const key = typeof data === 'string' ? data : data.toString();
      if (key === 'q' || key === '\x03') {
        // 'q' or Ctrl-C
        this.stop();
        process.exit(0);
      }
    };

    if (process.stdin.isTTY) {
      process.stdin.on('data', this.stdinListener);
    }

    // Handle Ctrl-C as backup
    this.sigintListener = (): void => {
      this.stop();
      process.exit(0);
    };
    process.on('SIGINT', this.sigintListener);
  }

  /**
   * Stop the dashboard — restores terminal to normal.
   */
  stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.stdinListener && process.stdin.isTTY) {
      process.stdin.removeListener('data', this.stdinListener);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      this.stdinListener = null;
    }

    if (this.sigintListener) {
      process.removeListener('SIGINT', this.sigintListener);
      this.sigintListener = null;
    }

    // Show cursor, reset colors
    process.stdout.write(ANSI.show + ANSI.reset);

    // Move to bottom and clear remaining lines
    const lines = this.renderLines().length;
    process.stdout.write(`\x1b[${lines + 2};1H\n`);
  }

  /**
   * Build the dashboard as an array of lines (for testing).
   * Does not touch the terminal — safe to call without start().
   */
  renderLines(): string[] {
    this.tick++;
    const status = this.fleet.status();
    const decision = this.fleet.getDecision();
    const uptime = formatUptime(Date.now() - this.startTime);
    return this.buildDashboard(status, decision, uptime, this.tick);
  }

  /**
   * Render one frame to stdout.
   */
  private render(): void {
    const lines = this.renderLines();
    const output = ANSI.home + lines.map((line) => ANSI.clearLine + line).join('\n') + '\n';
    process.stdout.write(output);
  }

  /**
   * Build the complete dashboard output.
   */
  private buildDashboard(
    status: FleetStatus,
    decision: GovernorDecision,
    uptime: string,
    tick: number,
  ): string[] {
    const W = 60; // Inner width
    const sc = statusConfig(status.conservation.status);
    const C = status.conservation.C;
    const lines: string[] = [];

    // ─── Header ─────────────────────────────────────────────────
    lines.push(
      BOX.topLeft + BOX.horizontal.repeat(W + 2) + BOX.topRight,
    );
    const title = `${ANSI.bold}SuperInstance Fleet Dashboard${ANSI.reset} — ${this.fleet.name}`;
    lines.push(
      `${BOX.vertical} ${center(title, W)} ${BOX.vertical}`.replace(
        /[\x1b][[].*?m/g,
        (m) => m, // Keep ANSI codes but account for visible width only
      ),
    );
    // Simplify: just use raw centering on visible text
    const titlePlain = `SuperInstance Fleet Dashboard — ${this.fleet.name}`;
    lines[lines.length - 1] = `${BOX.vertical} ${ANSI.bold}${center(titlePlain, W - 0)}${ANSI.reset} ${BOX.vertical}`;

    const law = `γ + η ≤ C   |   C = log₂(3) = ${C.toFixed(3)}`;
    lines.push(
      `${BOX.vertical} ${ANSI.dim}${center(law, W)}${ANSI.reset} ${BOX.vertical}`,
    );
    lines.push(
      BOX.teeDown + BOX.horizontal.repeat(W + 2) + BOX.teeUp,
    );

    // ─── Status Line ────────────────────────────────────────────
    const statusLine = `STATUS: ${sc.icon} ${sc.color}${ANSI.bold}${sc.label}${ANSI.reset}          δ = ${status.conservation.delta.toFixed(3)}`;
    lines.push(
      `${BOX.vertical}${ANSI.clearLine} ${statusLine}${' '.repeat(Math.max(0, W - this.stripAnsi(statusLine).length))} ${BOX.vertical}`,
    );

    // Blank line
    lines.push(this.emptyLine(W));

    // ─── Progress Bars ──────────────────────────────────────────
    const barWidth = 30;
    const gammaRatio = status.conservation.gamma / C;
    const etaRatio = status.conservation.eta / C;
    const deltaRatio = status.conservation.delta / C;

    lines.push(this.innerBoxTop(W));

    const gammaBar = progressBar(gammaRatio, barWidth);
    lines.push(
      this.innerBoxLine(
        W,
        `  ${ANSI.cyan}γ (coupling)${ANSI.reset}   ${ratioColor(gammaRatio)}${gammaBar}${ANSI.reset}  ${status.conservation.gamma.toFixed(3)} / ${C.toFixed(3)}`,
      ),
    );

    const etaBar = progressBar(etaRatio, barWidth);
    lines.push(
      this.innerBoxLine(
        W,
        `  ${ANSI.magenta}η (value)${ANSI.reset}      ${ratioColor(etaRatio)}${etaBar}${ANSI.reset}  ${status.conservation.eta.toFixed(3)} / ${C.toFixed(3)}`,
      ),
    );

    const deltaBar = progressBar(deltaRatio, barWidth);
    lines.push(
      this.innerBoxLine(
        W,
        `  ${sc.color}δ (budget)${ANSI.reset}     ${ratioColor(deltaRatio)}${deltaBar}${ANSI.reset}  ${status.conservation.delta.toFixed(3)}`,
      ),
    );

    lines.push(this.innerBoxBottom(W));

    // Blank line
    lines.push(this.emptyLine(W));

    // ─── Agent Count ────────────────────────────────────────────
    const agentLine = `AGENTS: ${ANSI.bold}${status.activeAgents}${ANSI.reset} active / ${status.agentCount} total`;
    lines.push(
      `${BOX.vertical} ${agentLine}${' '.repeat(Math.max(0, W - this.stripAnsi(agentLine).length - 1))}${BOX.vertical}`,
    );

    // Blank line
    lines.push(this.emptyLine(W));

    // ─── Agent Table ────────────────────────────────────────────
    // Header row
    const hdr = `  ${pad('ID', 12)}  ${pad('ROLE', 14)}  ${pad('γ-USED', 8)}  ${pad('γ-BUDGET', 9)}  ${pad('PHASE', 8)}  ${pad('δ', 5)}`;
    lines.push(
      `${BOX.vertical}${ANSI.dim}${hdr}${ANSI.reset}${' '.repeat(Math.max(0, W - this.stripAnsi(hdr).length))} ${BOX.vertical}`,
    );

    // Separator
    const sep = `  ${'─'.repeat(12)}  ${'─'.repeat(14)}  ${'─'.repeat(8)}  ${'─'.repeat(9)}  ${'─'.repeat(8)}  ${'─'.repeat(5)}`;
    lines.push(
      `${BOX.vertical}${ANSI.dim}${sep}${ANSI.reset}${' '.repeat(Math.max(0, W - sep.length))} ${BOX.vertical}`,
    );

    // Agent rows
    if (status.agents.length === 0) {
      const empty = `  ${ANSI.dim}(no agents spawned)${ANSI.reset}`;
      lines.push(
        `${BOX.vertical}${empty}${' '.repeat(Math.max(0, W - this.stripAnsi(empty).length))} ${BOX.vertical}`,
      );
    } else {
      for (const agent of status.agents) {
        const gammaBudget = agent.gammaUsed + agent.conservationRemaining;
        const remaining = Math.max(0, agent.conservationRemaining);
        const row = `  ${pad(agent.name, 12)}  ${pad(agent.role, 14)}  ${pad(agent.gammaUsed.toFixed(3), 8)}  ${pad(gammaBudget.toFixed(3), 9)}  ${pad(agent.phase, 8)}  ${pad(remaining.toFixed(2), 5)}`;
        lines.push(
          `${BOX.vertical}${row}${' '.repeat(Math.max(0, W - row.length))} ${BOX.vertical}`,
        );
      }
    }

    // Blank line
    lines.push(this.emptyLine(W));

    // ─── Governor Decision ──────────────────────────────────────
    const gc = governorColor(decision.action);
    const govLine = `GOVERNOR: ${gc}${ANSI.bold}${decision.action.toUpperCase()}${ANSI.reset} — ${decision.reason}`;
    // Truncate if too long
    const govVisible = this.stripAnsi(govLine);
    if (govVisible.length > W - 1) {
      // Split reason across lines
      const govPrefix = `GOVERNOR: ${gc}${ANSI.bold}${decision.action.toUpperCase()}${ANSI.reset} — `;
      const prefixVisible = this.stripAnsi(govPrefix);
      const reasonSpace = W - prefixVisible.length - 1;
      const reason = decision.reason.slice(0, reasonSpace);
      lines.push(
        `${BOX.vertical} ${govPrefix}${reason}${' '.repeat(Math.max(0, reasonSpace - reason.length))} ${BOX.vertical}`,
      );
    } else {
      lines.push(
        `${BOX.vertical} ${govLine}${' '.repeat(Math.max(0, W - govVisible.length - 1))} ${BOX.vertical}`,
      );
    }

    // Blank line
    lines.push(this.emptyLine(W));

    // ─── Footer ─────────────────────────────────────────────────
    const footer = `Uptime: ${uptime}  |  Tick: #${tick}  |  Press ${ANSI.bold}q${ANSI.reset} to quit`;
    lines.push(
      `${BOX.vertical} ${footer}${' '.repeat(Math.max(0, W - this.stripAnsi(footer).length - 1))} ${BOX.vertical}`,
    );

    // Bottom border
    lines.push(
      BOX.bottomLeft + BOX.horizontal.repeat(W + 2) + BOX.bottomRight,
    );

    return lines;
  }

  // ─── Layout Helpers ───────────────────────────────────────────────────────

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private emptyLine(width: number): string {
    return `${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`;
  }

  private innerBoxTop(width: number): string {
    const inner = BOX.innerTopLeft + BOX.innerHorizontal.repeat(width) + BOX.innerTopRight;
    return `${BOX.vertical} ${inner} ${BOX.vertical}`;
  }

  private innerBoxBottom(width: number): string {
    const inner = BOX.innerBottomLeft + BOX.innerHorizontal.repeat(width) + BOX.innerBottomRight;
    return `${BOX.vertical} ${inner} ${BOX.vertical}`;
  }

  private innerBoxLine(width: number, content: string): string {
    const visibleLen = this.stripAnsi(content).length;
    const padding = Math.max(0, width - visibleLen);
    return `${BOX.vertical} ${content}${' '.repeat(padding)} ${BOX.vertical}`;
  }
}
