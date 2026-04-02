'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageItem {
  id: string;
  prompt: string;
  storageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  stylePreset: string;
  createdAt: string;
}

const STYLES = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'bold_graphic', label: 'Bold Graphic' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: '3d_render', label: '3D Render' },
  { value: 'abstract_geometric', label: 'Abstract' },
  { value: 'sketch', label: 'Sketch' },
];

const DIMENSIONS = [
  { value: '1080x1080', label: '1080×1080 (Square)' },
  { value: '1080x1350', label: '1080×1350 (Portrait)' },
  { value: '1080x1920', label: '1080×1920 (Story/Reel)' },
  { value: '1200x628', label: '1200×628 (LinkedIn)' },
  { value: '1200x675', label: '1200×675 (Twitter)' },
  { value: '1000x1500', label: '1000×1500 (Pinterest)' },
  { value: '1920x1080', label: '1920×1080 (YouTube/Blog)' },
];

export function ImagesPageClient({ images }: { images: ImageItem[] }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [dimensions, setDimensions] = useState('1080x1080');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!prompt) return;
    setIsGenerating(true);
    const [w, h] = dimensions.split('x').map(Number);
    try {
      await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stylePreset: style, width: w, height: h }),
      });
      window.location.reload();
    } catch {
      // handle error
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <h1 className="text-heading-xl font-display text-foreground" data-testid="images-heading">Image Generation</h1>

      {/* Generator */}
      <Card className="border-brand-orange/20 bg-brand-orange/5" data-testid="image-generator">
        <CardContent className="py-4 space-y-3">
          <Input
            placeholder="Describe the image you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            data-testid="image-prompt-input"
          />
          <div className="flex gap-3">
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-44" data-testid="style-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={dimensions} onValueChange={setDimensions}>
              <SelectTrigger className="w-52" data-testid="dimension-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIMENSIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="bg-brand-orange hover:bg-brand-orange-hover text-brand-void"
              data-testid="generate-image-button"
            >
              <Sparkles className="size-4 mr-1.5" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image library */}
      <div>
        <h2 className="text-heading-md font-display text-foreground mb-4">Library ({images.length} images)</h2>
        {images.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="image-library">
            {images.map((img) => (
              <Card key={img.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.thumbnailUrl}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="py-3">
                  <p className="text-body-sm text-foreground truncate">{img.prompt}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{img.width}×{img.height}</Badge>
                    {img.stylePreset && <Badge variant="outline" className="text-[10px]">{img.stylePreset}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-body-sm text-muted-foreground">No images yet. Generate your first image above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
