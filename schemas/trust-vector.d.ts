/**
 * Trust Vector Schema
 * Trust metrics, fleet graph, and vessel identities
 */
export interface TrustVector {
    vessel_id: string;
    competence: number;
    reliability: number;
    honesty: number;
    benevolence: number;
    calculated_at: number;
    history?: TrustHistoryEntry[];
}
export interface TrustHistoryEntry {
    timestamp: number;
    event_type: string;
    delta: Partial<Record<keyof Omit<TrustVector, 'vessel_id' | 'calculated_at' | 'history'>, number>>;
    reason: string;
}
export interface VesselIdentity {
    id: string;
    name: string;
    type: 'agent' | 'service' | 'external';
    public_key?: string;
    metadata?: Record<string, unknown>;
    registered_at: number;
    last_seen_at: number;
}
export interface FleetGraph {
    nodes: FleetNode[];
    edges: FleetEdge[];
    calculated_at: number;
}
export interface FleetNode {
    id: string;
    vessel_id: string;
    role: string;
    status: 'active' | 'inactive' | 'unknown';
    metadata?: Record<string, unknown>;
}
export interface FleetEdge {
    source_id: string;
    target_id: string;
    weight: number;
    relationship: 'reports_to' | 'peers_with' | 'manages' | 'depends_on' | 'trusts';
    bidirectional: boolean;
}
