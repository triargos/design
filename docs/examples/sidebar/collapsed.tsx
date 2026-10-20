import { IconFolder, IconHome, IconInbox, IconSettings, IconSquareCheck, IconUsers } from '@tabler/icons-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
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
    title: 'Workspace',
    links: [
      { label: 'Overview', icon: <IconHome />, current: false },
      { label: 'Inbox', icon: <IconInbox />, current: false, count: 3 },
      { label: 'Tasks', icon: <IconSquareCheck />, current: true },
      {
        label: 'Projects',
        icon: <IconFolder />,
        current: false,
        children: ['Website redesign', 'Mobile app'],
      },
    ],
  },
  {
    title: 'Admin',
    links: [
      { label: 'Members', icon: <IconUsers />, current: false },
      { label: 'Settings', icon: <IconSettings />, current: false },
    ],
  },
] as const;

/** `collapsible='icon'`, closed: icons only. The trigger toggles it. */
export function SidebarCollapsed() {
  return (
    <div className='relative h-[600px] w-full overflow-hidden rounded-panel bg-sidebar'>
      <SidebarProvider className='h-full' defaultOpen={false}>
        <div className='flex h-full min-h-0 w-full md:pt-3 md:pr-3 md:pb-3'>
          <Sidebar collapsible='icon'>
            <SidebarHeader className='px-5 pt-group group-data-[collapsible=icon]:px-2'>
              <div className='flex items-center gap-2'>
                <span className='flex size-8 shrink-0 items-center justify-center rounded-control-sm bg-primary-solid text-caption font-medium text-primary-solid-foreground'>
                  AC
                </span>
                <span className='truncate text-body font-medium'>Acme Inc.</span>
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
                          <SidebarMenuButton current={link.current} className='relative w-full gap-3'>
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
                                  <SidebarMenuSubButton current={index === 0}>
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
                Jordan Lee · Admin
              </span>
            </SidebarFooter>
          </Sidebar>
          <div className='relative h-full min-w-0 flex-1 overflow-y-auto bg-background shadow-md ring ring-border/50 md:rounded-panel'>
            <div className='absolute top-3 left-3'>
              <SidebarTrigger />
            </div>
            <div className='px-5 pt-10 pb-28 md:px-10'>
              <div className='flex flex-col gap-page'>
                <hgroup className='flex flex-col gap-tight'>
                  <h1 className='text-title text-balance'>Tasks</h1>
                  <p className='text-body text-pretty text-muted-foreground'>Everything assigned to you this week.</p>
                </hgroup>
                <Card>
                  <CardHeader>
                    <CardTitle>Due today</CardTitle>
                  </CardHeader>
                  <CardContent className='h-24' />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
