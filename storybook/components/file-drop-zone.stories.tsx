import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaperclipIcon, UploadIcon } from 'lucide-react';

import { FileDropZone } from '~/components/ui/file-drop-zone';

import { FileDropZoneDefault } from '../examples/file-drop-zone/default';
import { FileDropZoneSizes } from '../examples/file-drop-zone/sizes';
import { FileDropZoneStates } from '../examples/file-drop-zone/states';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';

const meta = {
  title: 'Components/File Drop Zone',
  parameters: { description: 'A field surface you drop files on or click to pick them.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const STATES = ['idle', 'drag-over', 'invalid', 'disabled'] as const;
type State = (typeof STATES)[number];

const DefaultBody = () => (
  <>
    <span className='flex size-9 items-center justify-center rounded-full bg-card shadow-raised'>
      <UploadIcon className='size-4 text-muted-foreground' />
    </span>
    <div>
      <p className='text-body text-foreground'>Dateien hierher ziehen oder auswählen</p>
      <p className='text-caption text-muted-foreground'>Bis 10 MB, höchstens 6 Dateien</p>
    </div>
  </>
);

const CompactBody = () => (
  <>
    <PaperclipIcon className='size-4 shrink-0' />
    Datei anhängen
  </>
);

/** Drag-over is the zone's own state (`data-dragging`), forced here with the attribute. */
const zone = (size: 'default' | 'compact', state: State) => (
  <div key={size} className='w-full'>
    <FileDropZone
      size={size}
      onFiles={() => undefined}
      disabled={state === 'disabled'}
      aria-invalid={state === 'invalid'}
      aria-label='Dateien auswählen'
      className={state === 'drag-over' ? 'border-ring bg-background ring-3 ring-ring/24' : undefined}>
      {size === 'default' ? <DefaultBody /> : <CompactBody />}
    </FileDropZone>
  </div>
);

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='File Drop Zone'
      description='A field surface you drop files on or click to pick them. The default zone sits in a form; compact trades the fill for a dashed outline, so it does not read as a text field. FileUploadDropzone (components/files) adds the upload list and limits.'>
      <ExampleSection title='Default' description='Drag a file over it to see drag-over for real.'>
        <FileDropZoneDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>compact</Code> trades the fill for a dashed outline, so it does not read as a text field.
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
                {zone('compact', state)}
              </div>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <FileDropZoneDefault /> };
export const Sizes: Story = { render: () => <FileDropZoneSizes /> };
export const States: Story = { render: () => <FileDropZoneStates /> };
