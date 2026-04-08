/**
 * POST /api/reports/pdf
 * Generates a PDF report from report data using @react-pdf/renderer.
 * Auth required — analytics.view_dashboard permission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { z } from 'zod';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';

const metricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.string().optional(),
});

const reportSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  metrics: z.array(metricSchema).max(50),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string().optional(),
      metrics: z.array(metricSchema).optional(),
    }),
  ).max(20).optional(),
  generatedBy: z.string().optional(),
});

// PDF Document components using React.createElement (no JSX in .ts files)
const { Document, Page, Text, View, StyleSheet } = ReactPDF;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a2e',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #f97316',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 9,
    color: '#888',
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginBottom: 20,
    gap: 8,
  },
  metricCard: {
    width: '23%',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    border: '1px solid #e5e7eb',
  },
  metricLabel: {
    fontSize: 8,
    color: '#888',
    marginBottom: 3,
    textTransform: 'uppercase' as const,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  metricChange: {
    fontSize: 8,
    color: '#22c55e',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a2e',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  sectionContent: {
    fontSize: 10,
    color: '#444',
    lineHeight: 1.5,
  },
  tableRow: {
    flexDirection: 'row' as const,
    borderBottom: '1px solid #e5e7eb',
    paddingVertical: 4,
  },
  tableLabel: {
    width: '50%',
    fontSize: 9,
    color: '#666',
  },
  tableValue: {
    width: '30%',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableChange: {
    width: '20%',
    fontSize: 9,
    color: '#22c55e',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 8,
    fontSize: 8,
    color: '#aaa',
  },
  chartsPlaceholder: {
    height: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    border: '1px dashed #d1d5db',
    marginBottom: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  chartsPlaceholderText: {
    fontSize: 10,
    color: '#9ca3af',
  },
});

function buildPdfDocument(data: z.infer<typeof reportSchema>) {
  const h = React.createElement;

  const metricsCards = data.metrics.slice(0, 8).map((m, i) =>
    h(View, { key: `m-${i}`, style: styles.metricCard },
      h(Text, { style: styles.metricLabel }, m.label),
      h(Text, { style: styles.metricValue }, String(m.value)),
      m.change ? h(Text, { style: styles.metricChange }, m.change) : null,
    ),
  );

  const sections = (data.sections ?? []).map((sec, i) =>
    h(View, { key: `s-${i}`, style: styles.section },
      h(Text, { style: styles.sectionTitle }, sec.title),
      sec.content ? h(Text, { style: styles.sectionContent }, sec.content) : null,
      ...(sec.metrics ?? []).map((sm, j) =>
        h(View, { key: `sm-${i}-${j}`, style: styles.tableRow },
          h(Text, { style: styles.tableLabel }, sm.label),
          h(Text, { style: styles.tableValue }, String(sm.value)),
          sm.change ? h(Text, { style: styles.tableChange }, sm.change) : null,
        ),
      ),
    ),
  );

  return h(Document, {},
    h(Page, { size: 'A4', style: styles.page },
      // Header
      h(View, { style: styles.header },
        h(Text, { style: styles.logo }, 'Aura.ai'),
        h(Text, { style: styles.title }, data.title),
        data.subtitle ? h(Text, { style: styles.subtitle }, data.subtitle) : null,
        h(Text, { style: styles.dateRange }, `${data.dateRange.start} - ${data.dateRange.end}`),
      ),
      // Metrics grid
      h(View, { style: styles.metricsGrid }, ...metricsCards),
      // Charts placeholder
      h(View, { style: styles.chartsPlaceholder },
        h(Text, { style: styles.chartsPlaceholderText }, 'Charts and visualizations available in dashboard'),
      ),
      // Sections
      ...sections,
      // Footer
      h(View, { style: styles.footer, fixed: true },
        h(Text, {}, `Generated by ${data.generatedBy ?? 'Aura.ai'}`),
        h(Text, {}, new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })),
      ),
    ),
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const doc = buildPdfDocument(parsed.data);
  const pdfStream = await ReactPDF.renderToStream(doc);

  // Collect stream into buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
  }
  const buffer = Buffer.concat(chunks);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${Date.now()}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
