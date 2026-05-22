/**
 * Fleet Health Schema
 * Monitors service uptime, agent heartbeats, PLATO tile flow, and ZeroClaw status
 */
export interface ServiceStatus {
    name: string;
    status: 'up' | 'down' | 'degraded';
    response_time_ms: number;
    consecutive_failures: number;
    last_restart: number | null;
}
export interface AgentStatus {
    agent_id: string;
    last_heartbeat: number;
    status: 'active' | 'inactive' | 'unknown';
}
export interface HealthReport {
    timestamp: number;
    services: Record<string, ServiceStatus>;
    agents: Record<string, AgentStatus>;
    plato: {
        tile_flow_rate: number;
        chain_length: number;
        room_count: number;
    };
    zeroclaw: {
        running: boolean;
        last_log_activity: number;
    };
    actions_taken: string[];
}
