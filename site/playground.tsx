import { type ComponentType, useId, useState } from 'react';

import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';

import { ExampleCode, ExampleSourceContext, Preview, Section } from '../storybook/kit/blocks';

type Args = Record<string, unknown>;

interface ArgType {
  readonly control?: string | { readonly type?: string };
  readonly options?: ReadonlyArray<string>;
  readonly table?: { readonly disable?: boolean };
}

/** What a story file's meta gives the Playground. */
export interface PlaygroundMeta {
  readonly component?: { readonly displayName?: string; readonly name?: string };
  readonly args?: Args;
  readonly argTypes?: Record<string, ArgType>;
}

type Control =
  | { readonly kind: 'select'; readonly name: string; readonly options: ReadonlyArray<string> }
  | { readonly kind: 'boolean'; readonly name: string }
  | { readonly kind: 'text'; readonly name: string };

/** Props a control would only get wrong: the element type and the accessible name. */
const FIXED = new Set(['type', 'value']);

const controlType = (argType: ArgType | undefined) =>
  typeof argType?.control === 'string' ? argType.control : argType?.control?.type;

/** Controls from \`argTypes\` (selects with \`options\`, booleans), then from plain string and boolean \`args\`. */
export function controlsOf(meta: PlaygroundMeta): ReadonlyArray<Control> {
  const names = new Set([...Object.keys(meta.argTypes ?? {}), ...Object.keys(meta.args ?? {})]);
  return [...names].flatMap((name): ReadonlyArray<Control> => {
    const argType = meta.argTypes?.[name];
    const value = meta.args?.[name];
    if (argType?.table?.disable || FIXED.has(name) || name.startsWith('aria-')) return [];
    const type = controlType(argType);
    if ((type === 'select' || type === 'radio' || type === 'inline-radio') && argType?.options) {
      return [{ kind: 'select', name, options: argType.options }];
    }
    if (type === 'boolean' || typeof value === 'boolean') return [{ kind: 'boolean', name }];
    if (type === 'text' || typeof value === 'string') return [{ kind: 'text', name }];
    return [];
  });
}

const label = (name: string) => (name === 'children' ? 'Content' : name.replace(/([a-z])([A-Z])/g, '$1 $2'));

/** The JSX the controls describe: \`<Button intent='neutral'>Speichern</Button>\`. */
const jsxOf = (component: string, args: Args) => {
  const { children, ...props } = args;
  const attributes = Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== false && value !== '')
    .map(([name, value]) =>
      value === true ? name : typeof value === 'string' ? `${name}='${value}'` : `${name}={${JSON.stringify(value)}}`,
    );
  const open = [component, ...attributes].join(' ');
  return typeof children === 'string' && children !== '' ? `<${open}>${children}</${component}>` : `<${open} />`;
};

function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = useId();
  return (
    <Field orientation={control.kind === 'boolean' ? 'horizontal' : 'vertical'} className='min-w-0'>
      <FieldLabel htmlFor={id} className='capitalize'>
        {label(control.name)}
      </FieldLabel>
      {control.kind === 'select' && (
        <Select
          items={control.options.map((option) => ({ value: option, label: option }))}
          value={typeof value === 'string' ? value : null}
          onValueChange={(next) => onChange(next ?? undefined)}>
          <SelectTrigger id={id} size='sm' className='w-full'>
            <SelectValue placeholder='Default' />
          </SelectTrigger>
          <SelectContent>
            {control.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {control.kind === 'boolean' && <Switch id={id} checked={value === true} onCheckedChange={onChange} />}
      {control.kind === 'text' && (
        <Input
          id={id}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

/** The story's \`Playground\`, live, with a control per prop and the JSX the controls describe. */
export function Playground({
  Story,
  meta,
  controls,
}: {
  Story: ComponentType<Args>;
  meta: PlaygroundMeta;
  controls: ReadonlyArray<Control>;
}) {
  const [args, setArgs] = useState<Args>(() => ({ ...meta.args }));
  const component = meta.component?.displayName ?? meta.component?.name ?? 'Component';
  const code = jsxOf(component, args);
  return (
    <Section title='Playground'>
      <ExampleSourceContext value={() => code}>
        <Preview
          className='min-h-32 justify-center'
          footer={
            <>
              <div className='grid gap-group px-[calc(var(--spacing-group)+1px)] pt-group pb-related sm:grid-cols-2 lg:grid-cols-3'>
                {controls.map((control) => (
                  <ControlField
                    key={control.name}
                    control={control}
                    value={args[control.name]}
                    onChange={(value) => setArgs((current) => ({ ...current, [control.name]: value }))}
                  />
                ))}
              </div>
              <ExampleCode section='Playground' />
            </>
          }>
          <Story {...args} />
        </Preview>
      </ExampleSourceContext>
    </Section>
  );
}
