import { Button, type ButtonProps } from '~/components/ui/button';

import { Code, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const pairs = [
  { intent: 'primary', emphasis: 'solid' },
  { intent: 'neutral', emphasis: 'raised' },
  { intent: 'neutral', emphasis: 'ghost' },
  { intent: 'destructive', emphasis: 'solid' },
] as const satisfies ReadonlyArray<Pick<ButtonProps, 'intent' | 'emphasis'>>;

export default defineDocs({
  title: 'Loading',
  description: 'A pending action keeps its button and its width; a loading region shows its shape, pulsing.',
  group: 'Foundations',
  Page: () => (
    <FoundationPage
      title='Loading'
      description='A pending action keeps its button and its width; a loading region shows its shape, pulsing. The apply flow shows nothing, then fades in.'>
      <FoundationSection
        title='Pending action'
        description='Button isLoading: the label stays in the layout, invisible; the spinner shows at least 800ms, so a fast request does not flash.'>
        <SpecimenList>
          {pairs.map(({ intent, emphasis }) => (
            <SpecimenRow key={`${intent}-${emphasis}`} name={`${intent} / ${emphasis}`} meta={<Code>isLoading</Code>}>
              <div className='flex items-center gap-3'>
                <Button intent={intent} emphasis={emphasis}>
                  Save
                </Button>
                <Button intent={intent} emphasis={emphasis} isLoading>
                  Save
                </Button>
              </div>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
      <FoundationSection title='Components' description='Each has its own page under Components.'>
        <SpecimenList>
          <SpecimenRow name='Spinner' meta={<Code>Components › Spinner</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              The spinner alone, in currentColor. Inside a button, use isLoading instead.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Progress' meta={<Code>Components › Progress</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>Known progress, like an upload.</p>
          </SpecimenRow>
          <SpecimenRow name='Skeleton' meta={<Code>Components › Skeleton</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              A loading region in the shape of its content, pulsing.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Arriving content' meta={<Code>animate-in fade-in-0 duration-feedback</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              The content that replaces it fades in once, only when it arrives after the first render.
            </p>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
});
