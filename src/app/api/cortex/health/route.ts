/**
 * GET /api/cortex/health — Health check for Cortex AI availability
 * Called by CortexProvider every 30 seconds to detect degradation.
 */

import { NextResponse } from 'next/server';
import { checkCortexHealth } from '@/lib/cortex/health-check';

export async function GET() {
  const level = await checkCortexHealth();
  return NextResponse.json({ level, timestamp: Date.now() });
}
