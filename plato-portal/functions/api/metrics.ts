import { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  D1_FLEET_DB: D1Database;
  KV_FLEET_METRICS: KVNamespace;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;
  
  try {
    // Get total fleets count
    const fleetsResult = await env.D1_FLEET_DB.prepare('SELECT COUNT(*) as count FROM fleets').first();
    const totalFleets = fleetsResult?.count || 0;
    
    // Get active workers (fleets with last_seen > 5 minutes ago)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const activeResult = await env.D1_FLEET_DB.prepare(
      'SELECT COUNT(*) as count FROM fleets WHERE last_seen > ?'
    ).bind(fiveMinutesAgo).first();
    const activeWorkers = activeResult?.count || 0;
    
    // Get today's events
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const eventsResult = await env.D1_FLEET_DB.prepare(
      'SELECT COUNT(*) as count FROM fleet_events WHERE timestamp > ?'
    ).bind(todayStart.toISOString()).first();
    const todayEvents = eventsResult?.count || 0;
    
    // Get recent events (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentEvents = await env.D1_FLEET_DB.prepare(
      'SELECT timestamp, fleet_id as fleetId, metric_type as metricType, value FROM fleet_events WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 50'
    ).bind(twentyFourHoursAgo).all();
    
    return new Response(JSON.stringify({
      totalFleets,
      activeWorkers,
      todayEvents,
      events: recentEvents.results || []
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch metrics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle POST requests to record fleet metrics
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;
  
  try {
    const body = await context.request.json();
    const { fleetId, fleetName, metricType, value } = body;
    
    if (!fleetId || !metricType || value === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields: fleetId, metricType, value' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Upsert fleet record
    await env.D1_FLEET_DB.prepare(
      `INSERT INTO fleets (id, name, last_seen) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = ?, last_seen = ?`
    ).bind(fleetId, fleetName || fleetId, new Date().toISOString(), fleetName || fleetId, new Date().toISOString()).run();
    
    // Record the event
    await env.D1_FLEET_DB.prepare(
      `INSERT INTO fleet_events (fleet_id, metric_type, value) VALUES (?, ?, ?)`
    ).bind(fleetId, metricType, String(value)).run();
    
    // Update KV cache for real-time counts
    await env.KV_FLEET_METRICS.put(`fleet:${fleetId}`, JSON.stringify({
      lastSeen: new Date().toISOString(),
      metricType,
      value
    }), { expirationTtl: 60 * 60 * 24 });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Metric recorded successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error recording metric:', error);
    return new Response(JSON.stringify({ error: 'Failed to record metric' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}