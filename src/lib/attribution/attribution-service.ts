/**
 * UTM Attribution Service
 * Tracks touchpoints from published content links back to lead conversion.
 * Pure internal calculation — no external API.
 */

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay';

export interface Touchpoint {
  channel: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  timestamp: Date;
}

export interface AttributionResult {
  touchpoints: Touchpoint[];
  model: AttributionModel;
  attribution: { channel: string; weight: number; campaign?: string }[];
}

/**
 * Calculate attribution weights for a set of touchpoints.
 */
export function calculateAttribution(
  touchpoints: Touchpoint[],
  model: AttributionModel = 'last_touch',
): AttributionResult {
  if (touchpoints.length === 0) {
    return { touchpoints: [], model, attribution: [] };
  }

  const sorted = [...touchpoints].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let attribution: { channel: string; weight: number; campaign?: string }[];

  switch (model) {
    case 'first_touch':
      attribution = [{ channel: sorted[0].channel, weight: 1, campaign: sorted[0].utmCampaign }];
      break;

    case 'last_touch':
      attribution = [{ channel: sorted[sorted.length - 1].channel, weight: 1, campaign: sorted[sorted.length - 1].utmCampaign }];
      break;

    case 'linear': {
      const weight = 1 / sorted.length;
      attribution = sorted.map((t) => ({ channel: t.channel, weight: Math.round(weight * 1000) / 1000, campaign: t.utmCampaign }));
      break;
    }

    case 'time_decay': {
      // More recent touchpoints get more credit (exponential decay)
      const now = sorted[sorted.length - 1].timestamp.getTime();
      const halfLifeMs = 7 * 24 * 60 * 60 * 1000; // 7-day half-life
      const rawWeights = sorted.map((t) => {
        const ageMs = now - t.timestamp.getTime();
        return Math.pow(0.5, ageMs / halfLifeMs);
      });
      const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0);
      attribution = sorted.map((t, i) => ({
        channel: t.channel,
        weight: Math.round((rawWeights[i] / totalWeight) * 1000) / 1000,
        campaign: t.utmCampaign,
      }));
      break;
    }

    default:
      attribution = [{ channel: sorted[sorted.length - 1].channel, weight: 1 }];
  }

  return { touchpoints: sorted, model, attribution };
}
