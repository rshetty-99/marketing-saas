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
import { Mic, Sparkles, FolderOpen, Globe, Zap, Eye, PenLine, MicVocal, Loader2, X, Check } from 'lucide-react';

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
  const [sampleTopic, setSampleTopic] = useState('our latest product launch');
  const [samplePlatform, setSamplePlatform] = useState('linkedin');
  const [sampleResult, setSampleResult] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceAnalysis, setVoiceAnalysis] = useState<Record<string, unknown> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  async function handlePreviewPrompt() {
    const res = await fetch('/api/brand/test-voice', { method: 'POST' });
    const data = await res.json();
    setTestResult(data.systemPrompt ?? 'No voice profile configured.');
    setSampleResult(null);
  }

  async function handleGenerateSample() {
    setIsGeneratingSample(true);
    setSampleResult(null);
    setTestResult(null);
    try {
      const res = await fetch('/api/brand/generate-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: sampleTopic, platform: samplePlatform }),
      });
      const data = await res.json();
      setSampleResult(data.sample ?? data.error ?? 'No result');
    } catch {
      setSampleResult('Failed to generate sample.');
    } finally {
      setIsGeneratingSample(false);
    }
  }

  function startRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setTranscript('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.start();
    setIsRecording(true);
    setTranscript('');
    setVoiceAnalysis(null);

    // Auto-stop after 60 seconds
    setTimeout(() => {
      try { recognition.stop(); } catch { /* already stopped */ }
    }, 60000);

    // Store reference to stop manually
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__auraRecognition = recognition;
  }

  function stopRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = (window as any).__auraRecognition;
    if (recognition) {
      try { recognition.stop(); } catch { /* already stopped */ }
    }
    setIsRecording(false);
  }

  async function analyzeVoice() {
    if (transcript.length < 20) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/brand/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setVoiceAnalysis(data.analysis ?? null);
    } catch {
      setVoiceAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function applyVoiceAnalysis() {
    if (!voiceAnalysis) return;
    if (voiceAnalysis.tone) setVoiceTone(voiceAnalysis.tone as string);
    if (voiceAnalysis.formalityLevel) setFormalityLevel(voiceAnalysis.formalityLevel as number);
    setShowVoiceRecorder(false);
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

              {/* Voice Testing Tools */}
              <div className="border-t border-border pt-4 mt-2">
                <p className="text-label text-muted-foreground mb-3">Test Your Brand Voice</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviewPrompt} data-testid="preview-prompt-button">
                    <Eye className="size-4 mr-1.5" />
                    Preview AI Prompt
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSampleResult(null); setTestResult(null); }} data-testid="generate-sample-toggle">
                    <PenLine className="size-4 mr-1.5" />
                    Generate Sample
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowVoiceRecorder(true)} data-testid="record-voice-button">
                    <MicVocal className="size-4 mr-1.5" />
                    Record Voice
                  </Button>
                </div>

                {/* Generate Sample Form */}
                {!testResult && !sampleResult && (
                  <Card className="mt-3 bg-muted/30">
                    <CardContent className="py-4">
                      <p className="text-sm font-ui font-medium mb-3">Generate a sample post using your brand voice</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <Input
                            placeholder="Topic: e.g., our latest product launch"
                            value={sampleTopic}
                            onChange={(e) => setSampleTopic(e.target.value)}
                            data-testid="sample-topic-input"
                          />
                        </div>
                        <Select value={samplePlatform} onValueChange={setSamplePlatform}>
                          <SelectTrigger data-testid="sample-platform-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="twitter">Twitter / X</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleGenerateSample}
                        disabled={isGeneratingSample || !sampleTopic}
                        className="mt-3"
                        data-testid="generate-sample-button"
                      >
                        {isGeneratingSample ? <><Loader2 className="size-4 mr-1.5 animate-spin" />Generating...</> : <><Sparkles className="size-4 mr-1.5" />Generate</>}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Preview Prompt Result */}
                {testResult && (
                  <Card className="mt-3 bg-muted/30">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-label text-muted-foreground">AI System Prompt Preview</p>
                        <Button variant="ghost" size="sm" onClick={() => setTestResult(null)} className="h-6 w-6 p-0"><X className="size-3.5" /></Button>
                      </div>
                      <pre className="text-body-sm text-foreground whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-60 overflow-y-auto" data-testid="voice-test-result">
                        {testResult}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Generated Sample Result */}
                {sampleResult && (
                  <Card className="mt-3 border-brand-orange/20">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px] bg-brand-orange/10 text-brand-orange border-brand-orange/20">{samplePlatform}</Badge>
                          <p className="text-label text-muted-foreground">AI-Generated Sample</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSampleResult(null)} className="h-6 w-6 p-0"><X className="size-3.5" /></Button>
                      </div>
                      <div className="text-body-sm text-foreground whitespace-pre-wrap leading-relaxed" data-testid="sample-result">
                        {sampleResult}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Voice Recording Modal */}
              {showVoiceRecorder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <Card className="w-full max-w-lg mx-4 shadow-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display flex items-center gap-2">
                          <MicVocal className="size-5 text-brand-orange" />
                          Record Voice Sample
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setShowVoiceRecorder(false)} className="h-8 w-8 p-0"><X className="size-4" /></Button>
                      </div>
                      <CardDescription>
                        Speak naturally about your business for 30-60 seconds. The AI will analyze your speaking style and suggest brand voice settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Record button */}
                      <div className="flex justify-center">
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`size-20 rounded-full flex items-center justify-center transition-all ${
                            isRecording
                              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/30'
                              : 'bg-brand-orange hover:bg-brand-orange-hover shadow-lg shadow-brand-orange/20'
                          }`}
                          data-testid="voice-record-toggle"
                        >
                          {isRecording ? (
                            <div className="size-6 rounded bg-white" />
                          ) : (
                            <Mic className="size-8 text-white" />
                          )}
                        </button>
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                      </p>

                      {/* Transcript */}
                      {transcript && (
                        <div className="rounded-lg bg-muted/50 p-3 max-h-32 overflow-y-auto">
                          <p className="text-label text-muted-foreground mb-1">Transcript</p>
                          <p className="text-body-sm text-foreground">{transcript}</p>
                        </div>
                      )}

                      {/* Analyze button */}
                      {transcript.length >= 20 && !isRecording && (
                        <Button
                          onClick={analyzeVoice}
                          disabled={isAnalyzing}
                          className="w-full"
                          data-testid="analyze-voice-button"
                        >
                          {isAnalyzing ? <><Loader2 className="size-4 mr-1.5 animate-spin" />Analyzing your voice...</> : <><Sparkles className="size-4 mr-1.5" />Analyze Voice</>}
                        </Button>
                      )}

                      {/* Analysis results */}
                      {voiceAnalysis && (
                        <div className="space-y-3">
                          <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm font-ui font-medium mb-2">Voice Analysis Results</p>
                            <p className="text-body-sm text-muted-foreground italic mb-3">&ldquo;{voiceAnalysis.summary as string}&rdquo;</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-muted-foreground">Tone:</span> <Badge variant="outline" className="ml-1">{voiceAnalysis.tone as string}</Badge></div>
                              <div><span className="text-muted-foreground">Formality:</span> <Badge variant="outline" className="ml-1">{voiceAnalysis.formalityLevel as number}/10</Badge></div>
                              <div><span className="text-muted-foreground">Energy:</span> <Badge variant="outline" className="ml-1">{voiceAnalysis.energyLevel as string}</Badge></div>
                              <div><span className="text-muted-foreground">Vocabulary:</span> <Badge variant="outline" className="ml-1">{voiceAnalysis.vocabularyComplexity as string}</Badge></div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {((voiceAnalysis.personalityTraits as string[]) ?? []).map((trait) => (
                                <Badge key={trait} className="text-[10px] bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20">{trait}</Badge>
                              ))}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <span>Confidence:</span>
                              <span className="font-medium">{Math.round((voiceAnalysis.confidence as number) * 100)}%</span>
                            </div>
                          </div>

                          {/* Comparison: Current vs Detected */}
                          <div className="rounded-lg border border-brand-orange/20 p-3">
                            <p className="text-xs font-ui font-medium mb-2">Current vs Detected</p>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Tone</span>
                                <span>{voiceTone} <span className="text-muted-foreground mx-1">→</span> <span className="text-brand-orange font-medium">{voiceAnalysis.tone as string}</span></span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Formality</span>
                                <span>{formalityLevel}/10 <span className="text-muted-foreground mx-1">→</span> <span className="text-brand-orange font-medium">{voiceAnalysis.formalityLevel as number}/10</span></span>
                              </div>
                            </div>
                          </div>

                          <Button onClick={applyVoiceAnalysis} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white" data-testid="apply-voice-button">
                            <Check className="size-4 mr-1.5" />
                            Apply to Brand Voice
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
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
