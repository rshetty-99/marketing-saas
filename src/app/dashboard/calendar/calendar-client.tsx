'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarClientProps {
  workspaceId: string;
  canEdit: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  eventType: string;
  startAt: string;
  color?: string;
}

const EVENT_COLORS: Record<string, string> = {
  publish: 'bg-brand-orange',
  approval_deadline: 'bg-yellow-500',
  content_due: 'bg-blue-500',
  meeting: 'bg-purple-500',
  campaign_launch: 'bg-green-500',
  review: 'bg-indigo-500',
  deadline: 'bg-red-500',
  custom: 'bg-muted-foreground',
};

export function CalendarClient({ workspaceId, canEdit }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'list'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Fetch events for current month
  useEffect(() => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    fetch(`/api/calendar/events?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, [year, month]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function getEventsForDay(day: number): CalendarEvent[] {
    return events.filter((e) => {
      const d = new Date(e.startAt);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-heading-xl font-display text-foreground">Calendar</h1>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-body-sm rounded ${view === 'month' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 text-body-sm rounded ${view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              List
            </button>
          </div>
          {canEdit && (
            <Button size="sm" data-testid="create-event-button">
              <Plus className="size-4 mr-1.5" />
              New Event
            </Button>
          )}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-heading-md font-display" data-testid="calendar-month-label">
          {monthName} {year}
        </h2>
        <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {view === 'month' ? (
        /* Month grid */
        <div data-testid="calendar-grid">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-label text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div
                  key={i}
                  className={`min-h-[80px] rounded-lg border border-border/50 p-1 ${
                    day === null ? 'bg-transparent' : 'bg-card hover:bg-muted/30'
                  } ${isToday(day ?? 0) ? 'ring-2 ring-brand-orange/30' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-body-sm font-ui ${isToday(day) ? 'text-brand-orange font-medium' : 'text-muted-foreground'}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate text-white ${EVENT_COLORS[event.eventType] ?? 'bg-muted-foreground'}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="space-y-2" data-testid="calendar-list">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-body-sm text-muted-foreground">No events this month.</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className={`size-3 rounded-full ${EVENT_COLORS[event.eventType] ?? 'bg-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="font-ui text-sm text-foreground">{event.title}</p>
                    <p className="text-body-sm text-muted-foreground">
                      {new Date(event.startAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{event.eventType.replace('_', ' ')}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`size-2.5 rounded-full ${color}`} />
            <span className="text-[10px] text-muted-foreground">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </>
  );
}
