import { IconDots } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import { TooltipAlignment } from '../examples/tooltip/alignment';
import { TooltipDefault } from '../examples/tooltip/default';
import { TooltipDelayGroup } from '../examples/tooltip/delay-group';
import { TooltipPositions } from '../examples/tooltip/positions';
import { ExampleSection, FoundationPage, FoundationSection, Preview } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Tooltip',
  description: 'A name for an icon-only control, after 200ms.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Tooltip'
      description='A name for an icon-only control, after 200ms: a small popup. Opened by keyboard focus, it shows without animation.'>
      <ExampleSection title='Default' description='Hover the button.'>
        <TooltipDefault />
      </ExampleSection>
      <ExampleSection title='Positions'>
        <TooltipPositions />
      </ExampleSection>
      <ExampleSection title='Alignment'>
        <TooltipAlignment />
      </ExampleSection>
      <ExampleSection
        title='Delay group'
        description='Icon-only buttons in one TooltipProvider: the first tooltip opens after 200ms, its neighbours at once.'>
        <TooltipDelayGroup />
      </ExampleSection>

      <FoundationSection title='Open' description='Switch the mode and surface in the toolbar.'>
        <Preview title='TooltipContent' className='h-28 items-end justify-center'>
          <Tooltip open>
            <TooltipTrigger render={<Button emphasis='ghost' size='icon' aria-label='More actions' />}>
              <IconDots />
            </TooltipTrigger>
            <TooltipContent>More actions</TooltipContent>
          </Tooltip>
        </Preview>
      </FoundationSection>
    </FoundationPage>
  ),
});
