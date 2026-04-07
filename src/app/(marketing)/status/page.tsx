'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';

type ServiceStatus = 'operational' | 'degraded' | 'down';

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
  uptimeSegments: { status: ServiceStatus; width: string }[];
}

const SERVICES: Service[] = [
  {
    name: 'App',
    status: 'operational',
    uptime: '99.98%',
    uptimeSegments: [
      { status: 'operational', width: '98.5%' },
      { status: 'degraded', width: '0.3%' },
      { status: 'operational', width: '1.2%' },
    ],
  },
  {
    name: 'API',
    status: 'operational',
    uptime: '99.95%',
    uptimeSegments: [
      { status: 'operational', width: '97%' },
      { status: 'degraded', width: '0.5%' },
      { status: 'operational', width: '2%' },
      { status: 'degraded', width: '0.2%' },
      { status: 'operational', width: '0.3%' },
    ],
  },
  {
    name: 'Social Publishing',
    status: 'operational',
    uptime: '99.92%',
    uptimeSegments: [
      { status: 'operational', width: '96%' },
      { status: 'degraded', width: '0.8%' },
      { status: 'operational', width: '2.5%' },
      { status: 'down', width: '0.1%' },
      { status: 'operational', width: '0.6%' },
    ],
  },
  {
    name: 'Email Service',
    status: 'operational',
    uptime: '99.97%',
    uptimeSegments: [
      { status: 'operational', width: '99.2%' },
      { status: 'degraded', width: '0.2%' },
      { status: 'operational', width: '0.6%' },
    ],
  },
  {
    name: 'Storage',
    status: 'operational',
    uptime: '99.99%',
    uptimeSegments: [
      { status: 'operational', width: '100%' },
    ],
  },
];

function StatusDot({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function statusLabel(status: ServiceStatus): string {
  const labels: Record<ServiceStatus, string> = {
    operational: 'Operational',
    degraded: 'Degraded',
    down: 'Down',
  };
  return labels[status];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === 'operational');
  const lastChecked = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 px-4 gradient-mesh">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-label text-brand-orange mb-6 block"
          >
            System Status
          </motion.span>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            {allOperational ? (
              <div className="inline-flex items-center gap-3 rounded-full bg-green-500/10 border border-green-500/20 px-6 py-3">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
                <span className="font-display font-medium text-xl text-green-600 dark:text-green-400">
                  All systems operational
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-6 py-3">
                <span className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm">!</span>
                <span className="font-display font-medium text-xl text-yellow-600 dark:text-yellow-400">
                  Some services degraded
                </span>
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            Last checked: {lastChecked}
          </motion.p>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {SERVICES.map((service) => (
              <motion.div
                key={service.name}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StatusDot status={service.status} />
                    <span className="font-ui text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{service.uptime} uptime</span>
                    <span className={`text-xs font-ui font-medium ${
                      service.status === 'operational' ? 'text-green-600 dark:text-green-400' :
                      service.status === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {statusLabel(service.status)}
                    </span>
                  </div>
                </div>

                {/* 90-day uptime bar */}
                <div className="flex h-2 rounded-full overflow-hidden bg-accent">
                  {service.uptimeSegments.map((seg, i) => {
                    const segColors: Record<ServiceStatus, string> = {
                      operational: 'bg-green-500',
                      degraded: 'bg-yellow-500',
                      down: 'bg-red-500',
                    };
                    return (
                      <div
                        key={i}
                        className={`${segColors[seg.status]}`}
                        style={{ width: seg.width }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">90 days ago</span>
                  <span className="text-[10px] text-muted-foreground">Today</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-24 px-4 gradient-mesh gradient-mesh-dual">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Mail className="w-8 h-8 text-brand-orange mx-auto mb-4" />
            <h2 className="font-display font-medium tracking-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Subscribe to status updates
            </h2>
            <p className="text-body-md text-muted-foreground mb-8 max-w-lg mx-auto">
              Get notified when something goes wrong. We send updates for incidents and scheduled maintenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
              />
              <button className="px-6 py-3 rounded-lg bg-brand-orange text-sm font-ui font-medium text-white hover:bg-brand-orange-hover transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
