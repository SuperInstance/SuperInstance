/**
 * Quality Score Schema
 * Tile quality labels and overall quality scoring
 */
export interface TileQualityLabel {
    novelty: number;
    correctness: number;
    completeness: number;
    depth: number;
    overall: number;
}
export interface QualityScore {
    tile_id: string;
    version: number;
    labels: TileQualityLabel;
    assessed_at: number;
    assessor?: string;
    reasoning?: string;
    metadata?: Record<string, unknown>;
}
