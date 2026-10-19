import pages from 'virtual:docs-index';

import { TabsList, TabsTrigger } from '~/components/ui/tabs';
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
} from '~/components/ui/sidebar';

import { CustomizeTrigger } from './customize';
import { TriargosLogo } from './logo';
import { pathOf, prefetchPage } from './page';
import { Link, useRouter } from './router';
import { Search } from './search';
import { type ThemePreference, useTheme } from './theme';

export const GROUPS = ['Foundations', 'Components', 'Patterns'] as const;

const THEMES: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** The wordmark: the Triargos mark and the site name, linking home. */
export function Wordmark() {
  return (
    <Link href='/' className='flex items-center gap-2 rounded-control-sm text-body font-medium text-sidebar-foreground'>
      <TriargosLogo />
      Triargos Design
    </Link>
  );
}

function ThemePicker() {
  const [theme, setTheme] = useTheme();
  return (
    <TabsList
      as='radio'
      variant='segmented'
      aria-label='Theme'
      value={theme}
      onValueChange={(value) => setTheme(value as ThemePreference)}
      className='w-full'>
      {THEMES.map(({ value, label }) => (
        <TabsTrigger key={value} value={value} className='flex-1'>
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

/** The docs sidebar: the wordmark and search, one group per story group, the theme picker at the foot. */
export function DocsSidebar() {
  const { pathname } = useRouter();
  return (
    <Sidebar className='border-e-0!'>
      <SidebarHeader className='px-3 pt-group'>
        <header className='flex flex-col gap-group'>
          <div className='px-2'>
            <Wordmark />
          </div>
          <Search />
        </header>
      </SidebarHeader>
      <SidebarContent className='px-1'>
        <nav aria-label='Pages' className='flex flex-col gap-2'>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === '/'}
                  render={<Link href='/' aria-current={pathname === '/' ? 'page' : undefined} />}>
                  Introduction
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {GROUPS.map((group) => (
            <SidebarGroup key={group}>
              <SidebarGroupLabel render={<h2 />}>{group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pages
                    .filter((page) => page.group === group)
                    .map((page) => (
                      <SidebarMenuItem key={page.slug}>
                        <SidebarMenuButton
                          isActive={pathname === pathOf(page)}
                          render={
                            <Link
                              href={pathOf(page)}
                              prefetch={prefetchPage(page)}
                              aria-current={pathname === pathOf(page) ? 'page' : undefined}
                            />
                          }>
                          {page.name}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className='px-3 pb-group'>
        <footer className='flex flex-col gap-related'>
          <SidebarMenu>
            <SidebarMenuItem>
              <CustomizeTrigger />
            </SidebarMenuItem>
          </SidebarMenu>
          <ThemePicker />
        </footer>
      </SidebarFooter>
    </Sidebar>
  );
}
