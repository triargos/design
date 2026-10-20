import { Badge } from '~/components/ui/badge';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { PageDescription, PageHeaderGroup, PageSection, PageTitle } from '~/components/ui/page-header';

import { Code, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs, useTokens } from '../kit/docs';
import { formatToken, TYPE_ROLES, type TypeRole, tokenValue, typeLineHeightToken, typeSizeToken } from '../kit/tokens';

/** Size / line height · weight · tracking, at the values tuned in Customize. */
const typeSpec = (globals: Record<string, unknown>, name: TypeRole['name']): string => {
  const role = TYPE_ROLES.find((candidate) => candidate.name === name);
  if (role === undefined) return '';
  const size = formatToken(typeSizeToken(role), tokenValue(globals, typeSizeToken(role)));
  const lineHeight = formatToken(typeLineHeightToken(role), tokenValue(globals, typeLineHeightToken(role)));
  return [`${size} / ${lineHeight}`, role.weight, role.tracking].filter((part) => part !== undefined).join(' · ');
};

// `tailwind.css` resets `--text-*`; these are the roles. Literal class names, so Tailwind generates them.
const roles = [
  {
    className: 'text-title',
    role: 'title',
    use: 'Page title; stat values with tabular-nums',
    owner: 'PageTitle',
  },
  {
    className: 'text-heading',
    role: 'heading',
    use: 'Section, dialog, sheet and empty-state titles',
    owner: 'PageSection, DialogTitle, SheetTitle, EmptyStateTitle',
  },
  {
    className: 'text-body',
    role: 'body',
    use: 'Reading text, descriptions (muted), titles of rows and cards (medium)',
    owner: 'InsetCardTitle, ItemTitle, *Description',
  },
  {
    className: 'text-control',
    role: 'control',
    use: 'Buttons, fields, menus, tabs, tables. 16px on touch fields, scaled to 14',
    owner: 'Button, Input, Select, MenuItem, TabsTrigger',
  },
  { className: 'text-caption', role: 'caption', use: 'Meta, timestamps, badges, tooltips', owner: 'Badge, Tooltip' },
  { className: 'text-overline', role: 'overline', use: 'Menu and group labels, uppercase', owner: 'MenuLabel' },
] as const;

const sentence = 'Website redesign kickoff';
const paragraph =
  'Review the scope and the timeline before you share the project. You can change both until the deadline; after that, the project moves to review.';

const tones = [
  { name: 'foreground', className: 'text-foreground' },
  { name: 'muted', className: 'text-muted-foreground' },
  { name: 'faint', className: 'text-faint-foreground' },
  { name: 'disabled', className: 'text-disabled-foreground' },
  { name: 'destructive', className: 'text-destructive' },
] as const;

export default defineDocs({
  title: 'Typography',
  description: 'Six roles.',
  group: 'Foundations',
  Page: () => {
    const globals = useTokens();
    return (
      <FoundationPage
        title='Typography'
        description='Six roles. Each fixes size, line height, tracking and weight. Emphasis is font-medium, tone is a text level; neither is a new size. A text-* size outside these roles does not compile.'>
        <FoundationSection
          title='Roles'
          description='The whole scale. Titles are applied by their owner component; body, control and caption are written directly.'>
          <SpecimenList>
            {roles.map(({ className, role, use, owner }) => (
              <SpecimenRow
                key={className}
                name={className}
                meta={
                  <>
                    {typeSpec(globals, role)}
                    <br />
                    {use}
                    <br />
                    <Code>{owner}</Code>
                  </>
                }>
                <p className={`${className} text-balance`}>{className === 'text-overline' ? 'Members' : sentence}</p>
              </SpecimenRow>
            ))}
          </SpecimenList>
        </FoundationSection>

        <FoundationSection
          title='Emphasis and tone'
          description='Text levels on the body and caption roles. Weight stops at medium.'>
          <SpecimenList>
            {(['text-body', 'text-caption'] as const).map((role) =>
              (['font-normal', 'font-medium'] as const).map((weight) => (
                <SpecimenRow
                  key={`${role} ${weight}`}
                  name={`${role} ${weight === 'font-medium' ? 'font-medium' : ''}`}>
                  <div className='flex flex-wrap gap-x-6 gap-y-1'>
                    {tones.map((tone) => (
                      <span key={tone.name} className={`${role} ${weight} ${tone.className}`}>
                        {tone.name}
                      </span>
                    ))}
                  </div>
                </SpecimenRow>
              )),
            )}
          </SpecimenList>
        </FoundationSection>

        <FoundationSection title='In context' description='Page → section → card → row. Each level is one step down.'>
          <div className='flex flex-col gap-8 rounded-card bg-background p-6 shadow-border'>
            <PageHeaderGroup>
              <PageTitle>{sentence}</PageTitle>
              <PageDescription>{paragraph}</PageDescription>
            </PageHeaderGroup>
            <PageSection title='Project details' description='Only admins see these details.'>
              <InsetCard>
                <InsetCardHeader>
                  <InsetCardTitle>Members</InsetCardTitle>
                  <InsetCardDescription>They get every project update.</InsetCardDescription>
                </InsetCardHeader>
                <InsetCardContent className='overflow-hidden'>
                  <ItemList>
                    <Item className='px-4'>
                      <ItemContent>
                        <ItemTitle>Anna Schmidt</ItemTitle>
                        <ItemDescription>anna@example.com</ItemDescription>
                      </ItemContent>
                      <Badge intent='success'>Active</Badge>
                    </Item>
                    <Item className='px-4'>
                      <ItemContent>
                        <ItemTitle>Jonas Weber</ItemTitle>
                        <ItemDescription>Invited March 12</ItemDescription>
                      </ItemContent>
                      <span className='text-caption text-muted-foreground tabular-nums'>3 days ago</span>
                    </Item>
                  </ItemList>
                </InsetCardContent>
              </InsetCard>
            </PageSection>
            <PageSection title='Overview'>
              <div className='grid grid-cols-3 gap-4'>
                {[
                  ['Tasks', '1,284'],
                  ['Open', '86'],
                  ['Blocked', '12'],
                ].map(([label, value]) => (
                  <div key={label} className='flex flex-col gap-1'>
                    <span className='text-caption text-muted-foreground'>{label}</span>
                    <span className='text-title tabular-nums'>{value}</span>
                  </div>
                ))}
              </div>
            </PageSection>
          </div>
        </FoundationSection>
      </FoundationPage>
    );
  },
});
