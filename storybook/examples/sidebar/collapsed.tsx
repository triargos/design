import { CalendarXIcon, FileTextIcon, HomeIcon, InboxIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeader, PageHeaderGroup } from '~/components/ui/page-header';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';

const GROUPS = [
  {
    title: 'Schule',
    links: [
      { label: 'Übersicht', icon: <HomeIcon />, active: false },
      { label: 'Posteingang', icon: <InboxIcon />, active: false, count: 3 },
      { label: 'Abwesenheiten', icon: <CalendarXIcon />, active: true },
      {
        label: 'Anmeldungen',
        icon: <FileTextIcon />,
        active: false,
        children: ['Einschulung 2025', 'Nachmittagsbetreuung'],
      },
    ],
  },
  {
    title: 'Verwaltung',
    links: [
      { label: 'Mitglieder', icon: <UsersIcon />, active: false },
      { label: 'Einstellungen', icon: <SettingsIcon />, active: false },
    ],
  },
] as const;

/** `collapsible='icon'`, closed: icons only. The trigger or ⌘[ toggles it. */
export function SidebarCollapsed() {
  return (
    <div className='relative h-[600px] w-full overflow-hidden rounded-panel bg-sidebar'>
      <SidebarProvider className='h-full' defaultOpen={false}>
        <div className='flex h-full min-h-0 w-full md:pt-3 md:pr-3 md:pb-3'>
          <Sidebar collapsible='icon'>
            <SidebarHeader className='px-5 pt-group group-data-[collapsible=icon]:px-2'>
              <div className='flex items-center gap-2'>
                <span className='flex size-8 shrink-0 items-center justify-center rounded-control-sm bg-primary-solid text-caption font-medium text-primary-solid-foreground'>
                  GS
                </span>
                <span className='truncate text-body font-medium'>Grundschule am See</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              {GROUPS.map((group) => (
                <SidebarGroup key={group.title} className='px-5 group-data-[collapsible=icon]:px-2'>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.links.map((link) => (
                        <SidebarMenuItem key={link.label}>
                          <SidebarMenuButton isActive={link.active} className='relative w-full gap-3'>
                            {link.icon}
                            <span>{link.label}</span>
                            {'count' in link && (
                              <Badge size='sm' shape='pill' className='absolute right-2 min-w-5 tabular-nums'>
                                {link.count}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                          {'children' in link && (
                            <SidebarMenuSub>
                              {link.children.map((child, index) => (
                                <SidebarMenuSubItem key={child}>
                                  <SidebarMenuSubButton isActive={index === 0}>
                                    <span>{child}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
            <SidebarFooter className='px-5 pb-group group-data-[collapsible=icon]:px-2'>
              <span className='truncate text-caption text-muted-foreground group-data-[collapsible=icon]:hidden'>
                Erika Mustermann · Sekretariat
              </span>
            </SidebarFooter>
          </Sidebar>
          <div className='relative h-full min-w-0 flex-1 overflow-y-auto bg-background shadow-md ring ring-border/50 md:rounded-panel'>
            <div className='absolute top-3 left-3'>
              <SidebarTrigger />
            </div>
            <div className='px-5 pt-10 pb-28 md:px-10'>
              <PageContent
                header={
                  <PageHeaderGroup>
                    <PageHeader>Abwesenheiten</PageHeader>
                    <PageDescription>Krankmeldungen und Termine der Kinder dieser Woche.</PageDescription>
                  </PageHeaderGroup>
                }>
                <InsetCard>
                  <InsetCardHeader>
                    <InsetCardTitle>Heute</InsetCardTitle>
                  </InsetCardHeader>
                  <InsetCardContent className='h-24' />
                </InsetCard>
              </PageContent>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
