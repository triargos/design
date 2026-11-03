import type { Attribute, ChildAttribute, Html } from 'foldkit/html';

export type Child = Html | string;

export type PartAttribute<Message> = Attribute<Message> | ChildAttribute;

export type PartConfig<Message> = Readonly<{
  className?: string | undefined;
  attributes?: ReadonlyArray<PartAttribute<Message>> | undefined;
  children?: ReadonlyArray<Child> | undefined;
}>;
