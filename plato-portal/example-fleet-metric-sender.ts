/**
 * Example Fleet Metric Sender - use this in your Cloudflare Workers to send metrics to the Plato Portal
 * 
 * Usage:
 * 1. Replace PLATO_PORTAL_URL with your actual dashboard URL
 * 2. Call recordFleetMetric from your Worker code
 */

const PLATO_PORTAL_URL = 'https://your-plato-portal.pages.dev';

interface FleetMetric {
  fleetId: string;
  fleetName?: string;
  metricType: string;
  value: string | number;
}

export async function recordFleetMetric(metric: FleetMetric): Promise<void> {
  try {
    await fetch(`${PLATO_PORTAL_URL}/api/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fleetId: metric.fleetId,
        fleetName: metric.fleetName,
        metricType: metric.metricType,
        value: metric.value
      })
    });
  } catch (error) {
    console.error('Failed to send fleet metric:', error);
  }
}

// Example usage in a Worker:
/*
async function handleRequest(request: Request): Promise<Response> {
  const fleetId = 'my-worker-fleet-1';
  
  // Record CPU usage
  const cpuUsage = Math.random() * 100;
  await recordFleetMetric({
    fleetId,
    fleetName: 'My Worker Fleet',
    metricType: 'cpu_usage',
    value: cpuUsage.toFixed(2)
  });
  
  return new Response('OK');
}

export default { fetch: handleRequest };*/