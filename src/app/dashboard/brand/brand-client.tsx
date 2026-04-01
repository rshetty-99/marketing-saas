'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Mic, Palette, Sparkles, FolderOpen, Globe, Zap } from 'lucide-react';

type Tab = 'voice' | 'strategy' | 'ai' | 'assets';

interface BrandPageClientProps {
  brand: Record<string, unknown>;
  workspaceId: string;
  readOnly: boolean;
}

export function BrandPageClient({ brand, workspaceId, readOnly }: BrandPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('voice');
  const [isSaving, setIsSaving] = useState(false);
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Form state from brand data
  const [brandName, setBrandName] = useState((brand.brandName as string) ?? '');
  const [primaryColor, setPrimaryColor] = useState((brand.primaryColor as string) ?? '#FF4D00');
  const [voiceTone, setVoiceTone] = useState((brand.voiceTone as string) ?? 'professional');

  const brandVoice = (brand.brandVoice ?? {}) as Record<string, unknown>;
  const [formalityLevel, setFormalityLevel] = useState((brandVoice.formalityLevel as number) ?? 5);

  const contentStrategy = (brand.contentStrategy ?? {}) as Record<string, unknown>;
  const [targetAudience, setTargetAudience] = useState((contentStrategy.targetAudience as string) ?? '');
  const [contentPillars, setContentPillars] = useState(
    ((contentStrategy.contentPillars as string[]) ?? []).join(', '),
  );

  const aiDefaults = (brand.aiDefaults ?? {}) as Record<string, unknown>;
  const [creativityLevel, setCreativityLevel] = useState((aiDefaults.aiCreativityLevel as string) ?? 'balanced');

  async function save(updates: Record<string, unknown>) {
    setIsSaving(true);
    await fetch('/api/brand', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setIsSaving(false);
  }

  async function handleExtractBrand() {
    if (!extractUrl) return;
    setIsExtracting(true);
    try {
      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractUrl }),
      });
      const data = await res.json();
      if (data.extracted) {
        if (data.extracted.brandName) setBrandName(data.extracted.brandName);
        if (data.extracted.primaryColor) setPrimaryColor(data.extracted.primaryColor);
      }
    } catch {
      // handle error
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleTestVoice() {
    const res = await fetch('/api/brand/test-voice', { method: 'POST' });
    const data = await res.json();
    setTestResult(data.systemPrompt ?? 'No voice profile configured.');
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'voice', label: 'Voice', icon: Mic },
    { key: 'strategy', label: 'Strategy', icon: Sparkles },
    { key: 'ai', label: 'AI Defaults', icon: Zap },
    { key: 'assets', label: 'Assets', icon: FolderOpen },
  ];

  return (
    <>
      {/* Header with extract URL */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-xl font-display text-foreground">Brand Voice</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Define your brand identity, voice, and content strategy.
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Paste website URL to extract brand..."
              value={extractUrl}
              onChange={(e) => setExtractUrl(e.target.value)}
              className="w-72"
              data-testid="extract-url-input"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtractBrand}
              disabled={isExtracting || !extractUrl}
              data-testid="extract-brand-button"
            >
              <Globe className="size-4 mr-1.5" />
              {isExtracting ? 'Extracting...' : 'Extract'}
            </Button>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border" data-testid="brand-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              data-testid={`brand-tab-${tab.key}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-ui border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-orange text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Voice Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Brand Identity</CardTitle>
              <CardDescription>Core brand name and visual identity.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Brand Name</Label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} disabled={readOnly} data-testid="brand-name-input" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} disabled={readOnly} className="size-10 rounded border border-border cursor-pointer" />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} disabled={readOnly} className="flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Voice & Tone</CardTitle>
              <CardDescription>How your brand sounds across all content.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Voice Tone</Label>
                  <Select value={voiceTone} onValueChange={setVoiceTone} disabled={readOnly}>
                    <SelectTrigger data-testid="voice-tone-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Formality Level: {formalityLevel}/10</Label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(parseInt(e.target.value, 10))}
                    disabled={readOnly}
                    className="w-full accent-brand-orange"
                    data-testid="formality-slider"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Very Casual</span>
                    <span>Very Formal</span>
                  </div>
                </div>
              </div>

              {/* Test Voice button */}
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleTestVoice} data-testid="test-voice-button">
                  <Sparkles className="size-4 mr-1.5" />
                  Test Voice
                </Button>
                {testResult && (
                  <Badge variant="outline" className="text-xs max-w-md truncate">
                    Voice prompt generated
                  </Badge>
                )}
              </div>

              {testResult && (
                <Card className="bg-muted/30">
                  <CardContent className="py-3">
                    <p className="text-label text-muted-foreground mb-2">Generated Voice System Prompt:</p>
                    <pre className="text-body-sm text-foreground whitespace-pre-wrap font-mono text-xs leading-relaxed" data-testid="voice-test-result">
                      {testResult}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {!readOnly && (
                <Button
                  onClick={() => save({ brandName, primaryColor, voiceTone, brandVoice: { formalityLevel } })}
                  disabled={isSaving}
                  className="w-fit"
                  data-testid="save-voice-button"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Content Strategy</CardTitle>
            <CardDescription>Define your content pillars, target audience, and editorial guidelines.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Target Audience</Label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Mid-market SaaS buyers, VP Marketing to CMO, 200-2000 employees"
                disabled={readOnly}
                data-testid="target-audience-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Content Pillars (comma-separated)</Label>
              <Input
                value={contentPillars}
                onChange={(e) => setContentPillars(e.target.value)}
                placeholder="e.g., thought_leadership, product_updates, customer_stories"
                disabled={readOnly}
                data-testid="content-pillars-input"
              />
            </div>
            {!readOnly && (
              <Button
                onClick={() => save({
                  contentStrategy: {
                    targetAudience,
                    contentPillars: contentPillars.split(',').map((p) => p.trim()).filter(Boolean),
                  },
                })}
                disabled={isSaving}
                className="w-fit"
                data-testid="save-strategy-button"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Defaults Tab */}
      {activeTab === 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">AI Generation Defaults</CardTitle>
            <CardDescription>Configure how AI generates content for your brand.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Creativity Level</Label>
              <Select value={creativityLevel} onValueChange={setCreativityLevel} disabled={readOnly}>
                <SelectTrigger data-testid="creativity-level-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative — Predictable, safe</SelectItem>
                  <SelectItem value="balanced">Balanced — Default</SelectItem>
                  <SelectItem value="creative">Creative — Bold, experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!readOnly && (
              <Button
                onClick={() => save({ aiDefaults: { aiCreativityLevel: creativityLevel } })}
                disabled={isSaving}
                className="w-fit"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Brand Assets</CardTitle>
            <CardDescription>Colors, typography, logos, and brand guidelines.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg border border-border" style={{ backgroundColor: primaryColor }} />
              <div>
                <p className="font-ui text-sm text-foreground">Primary Color</p>
                <p className="text-body-sm text-muted-foreground">{primaryColor}</p>
              </div>
            </div>
            <p className="text-body-sm text-muted-foreground">
              Full brand asset management (color palettes, typography, logo variants) will be available with file upload support in a future update.
              For now, manage your primary brand color on the Voice tab.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
