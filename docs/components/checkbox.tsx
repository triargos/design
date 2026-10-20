import { Checkbox } from '~/components/ui/checkbox';

import { CheckboxDefault } from '../examples/checkbox/default';
import { CheckboxDisabled } from '../examples/checkbox/disabled';
import { CheckboxGroup } from '../examples/checkbox/group';
import { CheckboxIndeterminate } from '../examples/checkbox/indeterminate';
import { CheckboxInvalid } from '../examples/checkbox/invalid';
import { CheckboxWithDescription } from '../examples/checkbox/with-description';
import { CheckboxWithLabel } from '../examples/checkbox/with-label';
import {
  Code,
  ExampleSection,
  FoundationPage,
  FoundationSection,
  Matrix,
  SpecimenList,
  SpecimenRow,
  StateCell,
} from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const STATES = ['rest', 'hover', 'focus', 'invalid', 'disabled'] as const;
const VALUES = [
  { name: 'unchecked', props: {} },
  { name: 'checked', props: { defaultChecked: true } },
  { name: 'indeterminate', props: { indeterminate: true } },
] as const;

export default defineDocs({
  title: 'Checkbox',
  description: 'One of many on or off, or an agreement.',
  group: 'Components',
  playground: {
    component: Checkbox,
    args: { 'aria-label': 'Select task' },
  },
  Page: () => (
    <FoundationPage
      title='Checkbox'
      description='One of many on or off, or an agreement. Flat: a 1px rim at rest, the brand fill when checked; indeterminate stands for a partial selection.'>
      <ExampleSection title='Default'>
        <CheckboxDefault />
      </ExampleSection>
      <ExampleSection title='Indeterminate' description='A parent that stands for a partial selection.'>
        <CheckboxIndeterminate />
      </ExampleSection>
      <ExampleSection
        title='With label'
        description={
          <>
            <Code>Field orientation='horizontal'</Code>
          </>
        }>
        <CheckboxWithLabel />
      </ExampleSection>
      <ExampleSection title='With description'>
        <CheckboxWithDescription />
      </ExampleSection>
      <ExampleSection
        title='Group'
        description={
          <>
            <Code>FieldSet · FieldLegend</Code>
          </>
        }>
        <CheckboxGroup />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <CheckboxDisabled />
      </ExampleSection>
      <ExampleSection title='Invalid' description='The rim turns destructive, as on a text field.'>
        <CheckboxInvalid />
      </ExampleSection>

      <FoundationSection
        title='Value × state'
        description='Forced here. Hover fills the box with the veil; focus rings for the keyboard only; invalid turns the rim, as on a text field.'>
        <Matrix
          columnWidth='5.5rem'
          columns={STATES}
          rows={VALUES.map((value) => ({
            name: value.name,
            cells: STATES.map((state) => (
              <StateCell key={state} state={state}>
                <Checkbox
                  aria-label={value.name}
                  aria-invalid={state === 'invalid' || undefined}
                  disabled={state === 'disabled'}
                  {...value.props}
                />
              </StateCell>
            )),
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Anatomy'>
        <SpecimenList>
          <SpecimenRow name='Size' meta={<Code>size-4 · rounded-control-xs</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              16px with a 4px corner. The target reaches past the label gap (<Code>after:</Code>), and to 44px on touch.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Rim' meta={<Code>inset-ring · neutral-border</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              A 1px ring inside the box, no shadow and no drop, so the 16px stays 16px and stays sharp. State recolors
              the rim: the ring color on focus, destructive when invalid; checked drops it for the brand fill.
            </p>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
});
