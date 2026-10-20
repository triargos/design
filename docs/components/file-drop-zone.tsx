import { PaperclipIcon, UploadIcon } from 'lucide-react';

import { FileDropZone } from '~/components/ui/file-drop-zone';

import { FileDropZoneDefault } from '../examples/file-drop-zone/default';
import { FileDropZoneSizes } from '../examples/file-drop-zone/sizes';
import { FileDropZoneStates } from '../examples/file-drop-zone/states';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const STATES = ['idle', 'drag-over', 'invalid', 'disabled'] as const;
type State = (typeof STATES)[number];

const DefaultBody = () => (
  <>
    <span className='flex size-9 items-center justify-center rounded-full bg-card shadow-raised'>
      <UploadIcon className='size-4 text-muted-foreground' />
    </span>
    <div>
      <p className='text-body text-foreground'>Drop files here or choose them</p>
      <p className='text-caption text-muted-foreground'>PDF or images, up to 10 MB each</p>
    </div>
  </>
);

const CompactBody = () => (
  <>
    <PaperclipIcon className='size-4 shrink-0' />
    Attach a file
  </>
);

/** Drag-over is the zone's own state (`data-dragging`), forced here with the attribute. */
const zone = (size: 'default' | 'sm', state: State) => (
  <div key={size} className='w-full'>
    <FileDropZone
      size={size}
      onFiles={() => undefined}
      disabled={state === 'disabled'}
      aria-invalid={state === 'invalid'}
      aria-label='Choose files'
      className={state === 'drag-over' ? 'border-ring bg-background ring-3 ring-ring/24' : undefined}>
      {size === 'default' ? <DefaultBody /> : <CompactBody />}
    </FileDropZone>
  </div>
);

export default defineDocs({
  title: 'File Drop Zone',
  description: 'A field surface you drop files on or click to pick them.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='File Drop Zone'
      description='A field surface you drop files on or click to pick them. The default zone sits in a form; sm is a row with a dashed outline, so it does not read as a text field.'>
      <ExampleSection title='Default' description='Drag a file over it to see drag-over for real.'>
        <FileDropZoneDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code>: a row with a dashed outline, so it does not read as a text field.
          </>
        }>
        <FileDropZoneSizes />
      </ExampleSection>
      <ExampleSection title='States' description='Invalid with its error, disabled.'>
        <FileDropZoneStates />
      </ExampleSection>

      <FoundationSection
        title='Size × state'
        description='Drag a file over the live zone below to see drag-over for real.'>
        <SpecimenList>
          {STATES.map((state) => (
            <SpecimenRow key={state} name={state}>
              <div className='grid items-center gap-related sm:grid-cols-[3fr_2fr]'>
                {zone('default', state)}
                {zone('sm', state)}
              </div>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
});
