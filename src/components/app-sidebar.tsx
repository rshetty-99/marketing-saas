'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchForm } from '@/components/search-form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { TrialBadge } from '@/components/features/F0/TrialBadge';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  PenTool,
  Repeat2,
  Send,
  CalendarDays,
  BarChart3,
  Search,
  Mail,
  Users,
  Image,
  FolderOpen,
  Settings,
  ChevronRight,
  Palette,
  Zap,
  Globe,
  CreditCard,
  Building2,
  ClipboardCheck,
  FileText,
  FileCode,
  Bot,
  MessageSquare,
  Tag,
  Ear,
  FlaskConical,
  Megaphone,
  Link2,
  Hash,
  Star,
  Film,
  Workflow,
  BookOpen,
  Rss,
  FileBarChart,
  Shield,
  Upload,
  MessageSquareText,
  FormInput,
  Target,
  Key,
  RefreshCw,
  ClipboardList,
  ImageIcon,
  Languages,
  ShieldCheck,
  LayoutGrid,
  ArrowDownToLine,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string;  // Required Firestore permission key. Omit = visible to all.
  agencyOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Inbox', url: '/dashboard/inbox', icon: Mail },
      { title: 'Saved Replies', url: '/dashboard/saved-replies', icon: MessageSquareText, permission: 'inbox.view' },
    ],
  },
  {
    title: 'Content',
    items: [
      { title: 'Briefs', url: '/dashboard/briefs', icon: ClipboardList, permission: 'content.view' },
      { title: 'Create', url: '/dashboard/content/create', icon: PenTool, permission: 'content.create_edit_drafts' },
      { title: 'Repurpose', url: '/dashboard/content/repurpose', icon: Repeat2, permission: 'content.create_edit_drafts' },
      { title: 'Approvals', url: '/dashboard/approvals', icon: ClipboardCheck, permission: 'approvals.submit_for_approval' },
      { title: 'Publish', url: '/dashboard/content/publish', icon: Send, permission: 'publishing.publish' },
      { title: 'Calendar', url: '/dashboard/calendar', icon: CalendarDays, permission: 'calendar.view' },
      { title: 'Bulk Schedule', url: '/dashboard/bulk-schedule', icon: Upload, permission: 'content.create_edit_drafts' },
      { title: 'Assets', url: '/dashboard/assets', icon: FolderOpen, permission: 'dam.view_download' },
      { title: 'Stock Photos', url: '/dashboard/stock-photos', icon: ImageIcon, permission: 'content.view' },
      { title: 'Images', url: '/dashboard/images', icon: Image, permission: 'images.generate' },
      { title: 'Video', url: '/dashboard/video', icon: Film, permission: 'content.create_edit_drafts' },
      { title: 'Snippets', url: '/dashboard/snippets', icon: BookOpen, permission: 'content.view' },
      { title: 'Localization', url: '/dashboard/localization', icon: Languages, permission: 'content.view' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3, permission: 'analytics.view_dashboard' },
      { title: 'Reports', url: '/dashboard/reports', icon: FileText, permission: 'analytics.view_dashboard' },
      { title: 'Report Builder', url: '/dashboard/report-builder', icon: FileBarChart, permission: 'analytics.view_dashboard' },
      { title: 'SEO', url: '/dashboard/seo', icon: Search, permission: 'seo.view_reports' },
      { title: 'Email', url: '/dashboard/email', icon: Mail, permission: 'email.view_analytics' },
      { title: 'Leads', url: '/dashboard/leads', icon: Users, permission: 'leads.create' },
      { title: 'Forms', url: '/dashboard/forms', icon: FormInput, permission: 'leads.create' },
      { title: 'Landing Pages', url: '/dashboard/landing-pages', icon: FileCode, permission: 'content.create_edit_drafts' },
      { title: 'A/B Tests', url: '/dashboard/ab-tests', icon: FlaskConical, permission: 'analytics.view_dashboard' },
      { title: 'Ad Campaigns', url: '/dashboard/ads', icon: Megaphone, permission: 'analytics.view_dashboard' },
      { title: 'Chatbot', url: '/dashboard/chatbot', icon: Bot, permission: 'content.view' },
      { title: 'Messaging', url: '/dashboard/messaging', icon: MessageSquare, permission: 'inbox.view' },
      { title: 'Links & UTM', url: '/dashboard/links', icon: Link2, permission: 'content.view' },
      { title: 'Hashtags', url: '/dashboard/hashtags', icon: Hash, permission: 'content.view' },
      { title: 'Listening', url: '/dashboard/listening', icon: Ear, permission: 'analytics.view_dashboard' },
      { title: 'Competitors', url: '/dashboard/competitors', icon: Target, permission: 'analytics.view_dashboard' },
      { title: 'Influencers', url: '/dashboard/influencers', icon: Star, permission: 'content.view' },
      { title: 'Advocacy', url: '/dashboard/advocacy', icon: Megaphone, permission: 'content.view' },
      { title: 'RSS Feeds', url: '/dashboard/rss-feeds', icon: Rss, permission: 'content.create_edit_drafts' },
    ],
  },
  {
    title: 'Automation',
    items: [
      { title: 'Workflows', url: '/dashboard/automations', icon: Workflow, permission: 'automation.view' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { title: 'Brand Voice', url: '/dashboard/brand', icon: Palette, permission: 'brand.view_profile' },
      { title: 'Integrations', url: '/dashboard/integrations', icon: Zap, permission: 'social.connect' },
      { title: 'CRM Sync', url: '/dashboard/crm-sync', icon: RefreshCw, permission: 'leads.create' },
      { title: 'Team', url: '/dashboard/team', icon: Users, permission: 'workspace.invite_members' },
      { title: 'Clients', url: '/dashboard/clients', icon: Building2, permission: 'clients.switch_context', agencyOnly: true },
      { title: 'Billing', url: '/dashboard/billing', icon: CreditCard, permission: 'billing.view' },
      { title: 'Moderation', url: '/dashboard/moderation', icon: ShieldCheck, permission: 'inbox.view' },
      { title: 'Dashboards', url: '/dashboard/custom-dashboards', icon: LayoutGrid, permission: 'analytics.view_dashboard' },
      { title: 'Compliance', url: '/dashboard/compliance', icon: Shield, permission: 'workspace.update_settings' },
      { title: 'Developer API', url: '/dashboard/developer', icon: Key, permission: 'workspace.update_settings' },
      { title: 'Migration', url: '/dashboard/migration', icon: ArrowDownToLine, permission: 'workspace.update_settings' },
      { title: 'White Label', url: '/dashboard/settings/white-label', icon: Tag, permission: 'workspace.update_settings', agencyOnly: true },
      { title: 'Settings', url: '/dashboard/settings', icon: Settings, permission: 'workspace.update_settings' },
    ],
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  workspaceName?: string;
  accountType?: string;
  trialEndsAt?: Date;
  permissions?: Record<string, boolean>;
}

export function AppSidebar({
  workspaceName = 'Workspace',
  accountType = 'freelancer',
  trialEndsAt,
  permissions = {},
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  function isItemVisible(item: NavItem): boolean {
    // Agency-only check
    if (item.agencyOnly && accountType !== 'agency') return false;
    // No permission required = visible to all
    if (!item.permission) return true;
    // Check Firestore permission
    return permissions[item.permission] === true;
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-orange">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-4.5"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 19h20L12 2z" className="text-brand-void" />
                  </svg>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-display text-sm font-medium">{workspaceName}</span>
                  <span className="text-label text-muted-foreground lowercase">{accountType}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          return (
            <Collapsible
              key={section.title}
              title={section.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-label text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <CollapsibleTrigger>
                    {section.title}
                    <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                              <Link href={item.url}>
                                <Icon className="size-4" />
                                <span className="font-ui text-sm">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        {trialEndsAt && (
          <div className="px-2 pb-2">
            <TrialBadge trialEndsAt={trialEndsAt} />
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'size-8 rounded-lg',
                    },
                  }}
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-ui text-sm">Account</span>
                  <span className="text-label text-muted-foreground">
                    <Globe className="inline size-2.5 mr-0.5" />
                    Manage
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
