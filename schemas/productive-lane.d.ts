/**
 * Productive Lane Schema
 * Intent goals, signals, and navigation patterns for agent workflows
 */
export interface IntentGoal {
    id: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    created_at: number;
    completed_at?: number;
    parent_goal_id?: string;
    metadata?: Record<string, unknown>;
}
export interface IntentSignal {
    id: string;
    type: 'goal_created' | 'goal_updated' | 'goal_completed' | 'goal_failed' | 'signal' | 'heartbeat' | 'error';
    source: string;
    target?: string;
    timestamp: number;
    payload: Record<string, unknown>;
    intent_goal_id?: string;
}
export interface NavigationPattern {
    id: string;
    name: string;
    description: string;
    steps: NavigationStep[];
    retry_policy?: RetryPolicy;
    timeout_ms?: number;
    enabled: boolean;
}
export interface NavigationStep {
    step_id: string;
    action: string;
    parameters?: Record<string, unknown>;
    expected_outcome?: string;
    on_failure?: 'abort' | 'retry' | 'skip';
}
export interface RetryPolicy {
    max_attempts: number;
    backoff_ms: number;
    backoff_multiplier?: number;
    jitter?: boolean;
}
export interface ProductiveLane {
    id: string;
    name: string;
    description: string;
    intent_goals: IntentGoal[];
    active_signal_id?: string;
    navigation_pattern_id?: string;
    current_step_id?: string;
    status: 'idle' | 'active' | 'paused' | 'completed' | 'failed';
    created_at: number;
    updated_at: number;
    metadata?: Record<string, unknown>;
}
