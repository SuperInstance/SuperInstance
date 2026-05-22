/**
 * PLATO Tile Schema
 * Tile submission and room metadata per actual PLATO server behavior
 */
export interface RoomMetadata {
    room: string;
    created_at: number;
    tile_count: number;
    last_activity: number;
    participants?: string[];
    metadata?: Record<string, unknown>;
}
export interface PlatoTile {
    id: string;
    room: string;
    content: string;
    author: string;
    created_at: number;
    parent_hash?: string;
    tile_hash: string;
    signature?: string;
    metadata?: Record<string, unknown>;
}
export interface SubmitResponse {
    status: 'accepted';
    room: string;
    tile_hash: string;
    accepted_at: number;
}
export interface ErrorResponse {
    status: 'rejected';
    reason: string;
    code?: string;
    details?: Record<string, unknown>;
}
export type SubmitResult = SubmitResponse | ErrorResponse;
