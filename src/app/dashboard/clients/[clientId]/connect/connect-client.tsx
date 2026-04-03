'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Plug, FileText, ExternalLink, Copy } from 'lucide-react';

interface ClientConnectWizardProps {
  clientId: string;
  clientName: string;
  brandName: string;
}

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', signupUrl: 'https://www.linkedin.com/company/setup/new/', type: 'Company Page' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', signupUrl: 'https://www.instagram.com/accounts/emailsignup/', type: 'Business Account' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', signupUrl: 'https://www.facebook.com/pages/create/', type: 'Business Page' },
  { id: 'twitter', name: 'Twitter / X', color: '#1DA1F2', signupUrl: 'https://twitter.com/i/flow/signup', type: 'Business Profile' },
  { id: 'tiktok', name: 'TikTok', color: '#000000', signupUrl: 'https://www.tiktok.com/signup', type: 'Business Account' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', signupUrl: 'https://www.youtube.com/channel_switcher', type: 'Brand Channel' },
  { id: 'pinterest', name: 'Pinterest', color: '#BD081C', signupUrl: 'https://www.pinterest.com/business/create/', type: 'Business Account' },
  { id: 'google_business', name: 'Google Business', color: '#4285F4', signupUrl: 'https://business.google.com/create', type: 'Business Profile' },
];

type PlatformStatus = 'not_started' | 'connected' | 'pending_client' | 'not_needed';

export function ClientConnectWizard({ clientId, clientName, brandName }: ClientConnectWizardProps) {
  const [statuses, setStatuses] = useState<Record<string, PlatformStatus>>(
    Object.fromEntries(PLATFORMS.map((p) => [p.id, 'not_started'])),
  );
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<string | null>(null);

  const connectedCount = Object.values(statuses).filter((s) => s === 'connected').length;
  const totalNeeded = Object.values(statuses).filter((s) => s !== 'not_needed').length;
  const progress = totalNeeded > 0 ? Math.round((connectedCount / totalNeeded) * 100) : 0;

  async function handleConnect(platformId: string) {
    setIsConnecting(platformId);
    try {
      await fetch('/api/social/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId, mockData: { platformDisplayName: brandName } }),
      });
      setStatuses((prev) => ({ ...prev, [platformId]: 'connected' }));
    } catch {
      // handle error
    } finally {
      setIsConnecting(null);
    }
  }

  function handleSkip(platformId: string) {
    setStatuses((prev) => ({ ...prev, [platformId]: 'not_needed' }));
  }

  function handleSendToClient(platformId: string) {
    setStatuses((prev) => ({ ...prev, [platformId]: 'pending_client' }));
    setShowGuide(null);
  }

  const setupGuideText = (platform: typeof PLATFORMS[number]) =>
    `Hi ${clientName},\n\nTo get started with your ${platform.name} presence, please:\n\n1. Go to: ${platform.signupUrl}\n2. Create a ${platform.type} using your brand name "${brandName}"\n3. Use your brand logo as the profile picture\n4. Once created, share the login credentials with us securely\n\nWe'll then connect the account to Aura for content publishing and analytics.\n\nBest regards,\nYour Agency Team`;

  return (
    <>
      <div>
        <h1 className="text-heading-xl font-display text-foreground">Connect Social Accounts</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Connect {clientName}&apos;s social media accounts across all platforms.
        </p>
      </div>

      {/* Progress */}
      <Card data-testid="connect-progress">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-ui text-sm">{connectedCount} of {totalNeeded} accounts connected</span>
            <span className="text-heading-md font-display text-brand-orange">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Platform Grid */}
      <div className="grid gap-4 sm:grid-cols-2" data-testid="platform-connect-grid">
        {PLATFORMS.map((platform) => {
          const status = statuses[platform.id];
          return (
            <Card key={platform.id} className={status === 'connected' ? 'border-green-500/30' : status === 'not_needed' ? 'opacity-40' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: platform.color }}>
                    {platform.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-ui text-sm font-medium">{platform.name}</p>
                    <p className="text-[11px] text-muted-foreground">{platform.type}</p>
                  </div>
                  {status === 'connected' && <CheckCircle className="size-5 text-green-500" />}
                  {status === 'pending_client' && <Badge className="bg-yellow-500/15 text-yellow-400 text-[10px]">Sent to Client</Badge>}
                  {status === 'not_needed' && <Badge variant="outline" className="text-[10px]">Skipped</Badge>}
                </div>

                {status === 'not_started' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting === platform.id}
                      data-testid={`connect-${platform.id}`}
                    >
                      <Plug className="size-3.5 mr-1.5" />
                      {isConnecting === platform.id ? 'Connecting...' : 'Connect Existing'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowGuide(showGuide === platform.id ? null : platform.id)}
                    >
                      <FileText className="size-3.5 mr-1.5" />
                      Setup Guide
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleSkip(platform.id)}>
                      Skip
                    </Button>
                  </div>
                )}

                {status === 'connected' && (
                  <p className="text-[11px] text-green-500">Connected as {brandName}</p>
                )}

                {/* Setup Guide Panel */}
                {showGuide === platform.id && (
                  <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label text-muted-foreground">Setup Guide for Client</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(setupGuideText(platform)); }}>
                          <Copy className="size-3 mr-1" />Copy
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={platform.signupUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-3 mr-1" />Open
                          </a>
                        </Button>
                      </div>
                    </div>
                    <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono">
                      {setupGuideText(platform)}
                    </pre>
                    <Button size="sm" className="mt-2 w-full" variant="outline" onClick={() => handleSendToClient(platform.id)}>
                      Mark as Sent to Client
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion */}
      {progress === 100 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="py-6 text-center">
            <CheckCircle className="size-10 text-green-500 mx-auto mb-3" />
            <p className="text-heading-md font-display text-foreground">All accounts connected!</p>
            <p className="text-body-sm text-muted-foreground mt-1">{clientName} is ready for content publishing across all platforms.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
