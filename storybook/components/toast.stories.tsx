import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from '@base-ui/react/toast';
import { useEffect, useState, type ReactNode } from 'react';

import { ToastProvider, makeToast } from '~/components/ui/toast';

import { ToastDedupe } from '../examples/toast/dedupe';
import { ToastDefault } from '../examples/toast/default';
import { ToastError } from '../examples/toast/error';
import { ToastInfo } from '../examples/toast/info';
import { ToastLoading } from '../examples/toast/loading';
import { ToastPromise } from '../examples/toast/promise';
import { ToastStack } from '../examples/toast/stack';
import { ToastSuccess } from '../examples/toast/success';
import { ToastWarning } from '../examples/toast/warning';
import { ToastWithAction } from '../examples/toast/with-action';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { open } from '../kit/play';

/**
 * Toasts report the outcome of something the user did: saved, failed, still running. Show them with `toast` from
 * `components/ui/toast`; the app renders one `ToastProvider`. A repeat of the same type, title and description updates
 * the open toast instead of stacking a copy.
 */
const meta = {
  title: 'Components/Toast',
  parameters: { description: 'A short report on what the user just did.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type StageToast = ReturnType<typeof makeToast>;

/**
 * A toast stack confined to a box: its own manager, its portal inside the box (`transform-gpu` makes the fixed
 * viewport position against it), no timeout, so the toasts stay open. The box is toast-wide, so the stack sits in it.
 */
function Stage({ show, height = 'h-28' }: { show: (stageToast: StageToast) => void; height?: string }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [manager] = useState(() => Toast.createToastManager());
  useEffect(() => {
    if (container) show(makeToast(manager));
  }, [container, manager, show]);
  return (
    <div
      ref={setContainer}
      className={`relative ${height} w-full max-w-104 transform-gpu overflow-hidden rounded-card bg-background`}>
      {container && <ToastProvider toastManager={manager} timeout={0} container={container} />}
    </div>
  );
}

const TYPES: ReadonlyArray<{ name: string; use: string; show: (stageToast: StageToast) => void }> = [
  { name: 'toast', use: 'Neutral news', show: (t) => t('Draft restored') },
  { name: 'toast.success', use: 'Saved, sent, done', show: (t) => t.success('Changes saved') },
  { name: 'toast.error', use: 'The action failed', show: (t) => t.error('Couldn’t save changes') },
  {
    name: 'toast.info',
    use: 'Something changed underneath',
    show: (t) => t.info('A newer version of this document is available'),
  },
  {
    name: 'toast.warning',
    use: 'Done, with a catch',
    show: (t) => t.warning('Published, 2 tasks skipped'),
  },
  { name: 'toast.loading', use: 'Still running; stays open', show: (t) => t.loading('Importing tasks…') },
];

const CONTENT: ReadonlyArray<{ name: string; meta: ReactNode; height?: string; show: (t: StageToast) => void }> = [
  {
    name: 'Description',
    meta: <Code>{'{ description }'}</Code>,
    height: 'h-36',
    show: (t) => t.error('Import failed', { description: 'The file has no task names in its first column.' }),
  },
  {
    name: 'Action',
    meta: <Code>{'{ action, timeout: 0 }'}</Code>,
    show: (t) => t('Draft restored', { timeout: 0, action: { label: 'Discard', onClick: () => undefined } }),
  },
  {
    name: 'Description and action',
    meta: <Code>{'{ description, action }'}</Code>,
    height: 'h-36',
    show: (t) =>
      t.success('Invoice sent', {
        description: 'Globex gets it by email in a few minutes.',
        action: { label: 'Open', onClick: () => undefined },
      }),
  },
];

const showStack = (t: StageToast) => {
  t.success('Changes saved');
  t.info('A newer version of this document is available');
  t.error('Couldn’t save changes', { description: 'Check your connection and try again.' });
};

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Toast'
      description='A short report on what the user just did. Toasts stack bottom right, close after 5 seconds, and pause while hovered. Swipe one away to close it early.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>toast(title)</Code>: neutral news.
          </>
        }>
        <ToastDefault />
      </ExampleSection>
      <ExampleSection title='Success'>
        <ToastSuccess />
      </ExampleSection>
      <ExampleSection
        title='Error'
        description={
          <>
            With a <Code>description</Code>: why, or what next.
          </>
        }>
        <ToastError />
      </ExampleSection>
      <ExampleSection title='Warning'>
        <ToastWarning />
      </ExampleSection>
      <ExampleSection title='Info'>
        <ToastInfo />
      </ExampleSection>
      <ExampleSection title='Loading' description='Spins and stays open until its id is updated to success or error.'>
        <ToastLoading />
      </ExampleSection>
      <ExampleSection
        title='Promise'
        description={
          <>
            <Code>toast.promise</Code>: loading, then success or error in place.
          </>
        }>
        <ToastPromise />
      </ExampleSection>
      <ExampleSection
        title='With action'
        description={
          <>
            One action at most; with an action it stays open (<Code>timeout: 0</Code>).
          </>
        }>
        <ToastWithAction />
      </ExampleSection>
      <ExampleSection title='Stack' description='The newest in front, at most three shown. Hover expands the stack.'>
        <ToastStack />
      </ExampleSection>
      <ExampleSection
        title='Dedupe'
        description='The same toast again updates the open one and replays a pulse (a shake for errors). Click twice.'>
        <ToastDedupe />
      </ExampleSection>

      <FoundationSection
        title='Types, open'
        description='The type picks the icon and its color. Loading spins and stays open until its id is updated to success or error.'>
        <SpecimenList>
          {TYPES.map(({ name, use, show }) => (
            <SpecimenRow key={name} name={use} meta={<Code>{name}</Code>}>
              <Stage show={show} />
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
      <FoundationSection
        title='Content, open'
        description='A title says what happened; a description says why or what next. One action at most, and a toast with an action stays open (timeout: 0) when the user must decide.'>
        <SpecimenList>
          {CONTENT.map(({ name, meta: specimenMeta, height, show }) => (
            <SpecimenRow key={name} name={name} meta={specimenMeta}>
              <Stage show={show} height={height} />
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>
      <FoundationSection
        title='Stack, open'
        description='The newest toast sits in front, at most three are shown. Hover expands the stack.'>
        <SpecimenList>
          <SpecimenRow name='Three toasts' meta={<Code>limit: 3</Code>}>
            <Stage show={showStack} height='h-40' />
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <ToastDefault />,
  play: open('click', 'Restore draft', 'Draft restored'),
};
export const Success: Story = {
  render: () => <ToastSuccess />,
  play: open('click', 'Save', 'Changes saved'),
};
export const Error: Story = {
  render: () => <ToastError />,
  play: open('click', 'Save', 'Couldn’t save changes'),
};
export const Warning: Story = {
  render: () => <ToastWarning />,
  play: open('click', 'Publish', 'Published, 2 tasks skipped'),
};
export const Info: Story = {
  render: () => <ToastInfo />,
  play: open('click', 'Check for updates', 'A newer version of this document is available'),
};
export const Loading: Story = {
  render: () => <ToastLoading />,
  play: open('click', 'Import tasks', 'Importing tasks…'),
};
export const Promise: Story = {
  render: () => <ToastPromise />,
  play: open('click', 'Upload invoice', 'Uploading invoice…'),
};
export const WithAction: Story = {
  name: 'With action',
  render: () => <ToastWithAction />,
  play: open('click', 'Restore draft', 'Discard'),
};
export const Stack: Story = {
  render: () => <ToastStack />,
  play: open('click', 'Show three toasts', 'Couldn’t save changes'),
};
export const Dedupe: Story = {
  render: () => <ToastDedupe />,
  play: open('click', 'Click twice', 'Couldn’t save changes'),
};
