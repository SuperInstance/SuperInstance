/**
 * Constraint Model Schema
 * Mutable constraints, override patterns, events, and decision deltas
 */
export type ConstraintOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
export interface Constraint<T = unknown> {
    field: string;
    operator: ConstraintOperator;
    value: T;
    description?: string;
}
export interface MutableConstraintModel {
    id: string;
    version: number;
    constraints: Constraint[];
    enabled: boolean;
    metadata?: Record<string, unknown>;
}
export interface OverridePattern {
    id: string;
    name: string;
    priority: number;
    match_conditions: Constraint[];
    overrides: Record<string, unknown>;
    enabled: boolean;
    created_at: number;
    expires_at?: number;
}
export interface OverrideEvent {
    id: string;
    pattern_id: string;
    triggered_at: number;
    context: Record<string, unknown>;
    applied_overrides: Record<string, unknown>;
    source: string;
}
export interface DecisionDelta {
    id: string;
    decision_id: string;
    timestamp: number;
    previous_value: unknown;
    new_value: unknown;
    reason: string;
    agent_id?: string;
}
