import { MoreHorizontalIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Callout, CalloutAction, CalloutContent } from '~/components/ui/callout';
import { Input } from '~/components/ui/input';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

import { Code, FoundationPage, FoundationSection, SpecimenList, SpecimenRow, Tile, TileGrid } from '../kit/blocks';
import { defineDocs, useTokens } from '../kit/docs';
import { formatToken, RADIUS_ROLES, radiusToken, tokenValue } from '../kit/tokens';

// Fixed steps. Literal class names, so Tailwind generates them.
const steps = [
  { className: 'rounded-xs', value: '2px' },
  { className: 'rounded-sm', value: '4px' },
  { className: 'rounded-md', value: '6px' },
  { className: 'rounded-lg', value: '8px' },
  { className: 'rounded-xl', value: '10px' },
  { className: 'rounded-2xl', value: '12px' },
  { className: 'rounded-3xl', value: '16px' },
  { className: 'rounded-4xl', value: '20px' },
  { className: 'rounded-5xl', value: '24px' },
] as const;

const ROLE_CLASS: Record<(typeof RADIUS_ROLES)[number]['name'], string> = {
  'control-xs': 'rounded-control-xs',
  'control-sm': 'rounded-control-sm',
  control: 'rounded-control',
  'control-lg': 'rounded-control-lg',
  popup: 'rounded-popup',
  card: 'rounded-card',
  dialog: 'rounded-dialog',
  panel: 'rounded-panel',
};

export default defineDocs({
  title: 'Shape',
  description: 'Radius follows the role: a control by its height, then popups, cards, dialogs and the page panel.',
  group: 'Foundations',
  Page: () => {
    const globals = useTokens();
    return (
      <FoundationPage
        title='Shape'
        description='Radius follows the role: a control by its height, then popups, cards, dialogs and the page panel. Nested corners stay concentric: inner = outer − inset.'>
        <FoundationSection
          title='Roles'
          description='Write the role, not the step. Tune each in Customize; every component follows.'>
          <TileGrid>
            {RADIUS_ROLES.map((role) => (
              <Tile
                key={role.name}
                name={ROLE_CLASS[role.name]}
                meta={`${formatToken(radiusToken(role), tokenValue(globals, radiusToken(role)))} · ${role.use}`}>
                <div className={`${ROLE_CLASS[role.name]} h-20 bg-card shadow-raised`} />
              </Tile>
            ))}
          </TileGrid>
        </FoundationSection>

        <FoundationSection
          title='Concentric'
          description='The outer surface sets --outer-radius and --outer-inset; what sits inside takes rounded-inner.'>
          <SpecimenList>
            <SpecimenRow name='Card' meta={<Code>rounded-card · p-1 → rounded-inner</Code>}>
              <InsetCard>
                <InsetCardHeader
                  actions={
                    <Button emphasis='ghost' size='icon-sm' aria-label='More'>
                      <MoreHorizontalIcon />
                    </Button>
                  }>
                  <InsetCardTitle>Header action, aligned with row actions</InsetCardTitle>
                </InsetCardHeader>
                <InsetCardContent className='p-group text-body text-muted-foreground'>Content, 4px in</InsetCardContent>
              </InsetCard>
            </SpecimenRow>
            <SpecimenRow name='Callout' meta={<Code>rounded-card · action 6px in</Code>}>
              <Callout>
                <CalloutContent>The trial ends on March 31.</CalloutContent>
                <CalloutAction>
                  <Button>Upgrade</Button>
                </CalloutAction>
              </Callout>
            </SpecimenRow>
          </SpecimenList>
        </FoundationSection>

        <FoundationSection
          title='Control heights'
          description='Controls that sit in one row share a height and a radius.'>
          <SpecimenList>
            <SpecimenRow name='40 · 44px' meta={<Code>rounded-control-lg · Button, Input</Code>}>
              <div className='flex max-w-md items-center gap-2'>
                <Input placeholder='Search' aria-label='Search' />
                <Button intent='primary'>Save</Button>
              </div>
            </SpecimenRow>
            <SpecimenRow name='32 · 36px' meta={<Code>rounded-control · Button sm, xs</Code>}>
              <div className='flex items-center gap-2'>
                <Button size='sm'>Edit</Button>
                <Button size='xs'>Filter</Button>
              </div>
            </SpecimenRow>
            <SpecimenRow name='20 · 24px' meta={<Code>rounded-control-sm · Badge</Code>}>
              <div className='flex items-center gap-2'>
                {(['sm', 'default'] as const).map((size) => (
                  <Badge key={size} size={size}>
                    {size}
                  </Badge>
                ))}
              </div>
            </SpecimenRow>
          </SpecimenList>
        </FoundationSection>

        <FoundationSection title='Steps' description='The fixed scale the roles pick from. 2px apart up to 12, then 4.'>
          <TileGrid className='md:grid-cols-5'>
            {steps.map(({ className, value }) => (
              <Tile key={className} name={className} meta={value}>
                <div className={`${className} h-16 bg-muted shadow-border`} />
              </Tile>
            ))}
          </TileGrid>
        </FoundationSection>
      </FoundationPage>
    );
  },
});
