import { IconCheck } from '@tabler/icons-react';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  type AvatarSize,
  getInitials,
} from '~/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

import { AvatarDefault } from '../examples/avatar/default';
import { AvatarFallbackExample } from '../examples/avatar/fallback';
import { AvatarGroupExample } from '../examples/avatar/group';
import { AvatarGroupSizes } from '../examples/avatar/group-sizes';
import { AvatarShapes } from '../examples/avatar/shapes';
import { AvatarSizes } from '../examples/avatar/sizes';
import { Code, ExampleSection, FoundationPage, FoundationSection, Matrix } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const SIZES = [
  { size: 'xxs', px: 12 },
  { size: 'xs', px: 16 },
  { size: 'sm', px: 20 },
  { size: 'md', px: 24 },
  { size: 'lg', px: 28 },
  { size: 'xl', px: 32 },
  { size: '2xl', px: 40 },
  { size: '3xl', px: 48 },
  { size: '4xl', px: 80 },
] as const satisfies readonly { size: AvatarSize; px: number }[];

/** An inline SVG portrait, so the example needs no network. */
const portrait = (background: string, figure: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='${background}'/><circle cx='20' cy='16' r='7' fill='${figure}'/><rect x='8' y='26' width='24' height='16' rx='8' fill='${figure}'/></svg>`,
  )}`;

const PEOPLE = [
  { name: 'Lena Park', photo: portrait('#fde68a', '#d97706') },
  { name: 'Omar Haddad', photo: portrait('#c7d2fe', '#6366f1') },
  { name: 'Sofia Rossi', photo: portrait('#bbf7d0', '#16a34a') },
  { name: 'Jonas Berg', photo: portrait('#fecdd3', '#e11d48') },
  { name: 'Mary-Kate van der Berg', photo: portrait('#e9d5ff', '#9333ea') },
] as const;

export default defineDocs({
  title: 'Avatar',
  description: 'A person or an organization: their photo, or their initials.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Avatar'
      description='A person or an organization: their photo, or their initials on a quiet fill. A hairline inside the edge keeps a photo off the surface behind it.'>
      <ExampleSection title='Default'>
        <AvatarDefault />
      </ExampleSection>
      <ExampleSection
        title='Group'
        description='Each avatar is cut out of the one before it, so the gap reads on any surface. A count pill takes the rest.'>
        <AvatarGroupExample />
      </ExampleSection>
      <ExampleSection title='Sizes' description='12 to 80px.'>
        <AvatarSizes />
      </ExampleSection>
      <ExampleSection title='Group sizes'>
        <AvatarGroupSizes />
      </ExampleSection>
      <ExampleSection title='Shapes' description='Round for people, square for organizations.'>
        <AvatarShapes />
      </ExampleSection>
      <ExampleSection
        title='Fallback'
        description='Initials on a quiet fill when there is no photo or it fails to load.'>
        <AvatarFallbackExample />
      </ExampleSection>

      <FoundationSection title='Size × content'>
        <Matrix
          columns={['image', 'initials', 'square', 'badge']}
          rows={SIZES.map(({ size, px }) => ({
            name: size,
            meta: <Code>{`${px}px`}</Code>,
            cells: [
              <Avatar key='i' size={size}>
                <AvatarImage src={PEOPLE[0].photo} alt={PEOPLE[0].name} />
                <AvatarFallback>{getInitials(PEOPLE[0].name)}</AvatarFallback>
              </Avatar>,
              <Avatar key='f' size={size}>
                <AvatarFallback>{getInitials(PEOPLE[4].name)}</AvatarFallback>
              </Avatar>,
              <Avatar key='s' size={size} shape='square'>
                <AvatarFallback>{getInitials('Northwind Studio')}</AvatarFallback>
              </Avatar>,
              <Avatar key='b' size={size}>
                <AvatarImage src={PEOPLE[2].photo} alt={PEOPLE[2].name} />
                <AvatarFallback>{getInitials(PEOPLE[2].name)}</AvatarFallback>
                <AvatarBadge>
                  <IconCheck />
                </AvatarBadge>
              </Avatar>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Group × size'
        description='Each avatar is cut out of the one before it, so the gap reads on any surface. A count pill takes the rest.'>
        <Matrix
          columns={['photos', 'initials', 'square']}
          rows={(['sm', 'md', 'xl', '2xl'] as const).map((size) => ({
            name: size,
            cells: [
              <AvatarGroup key='p' size={size}>
                {PEOPLE.map((person) => (
                  <Avatar key={person.name}>
                    <AvatarImage src={person.photo} alt={person.name} />
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>,
              <AvatarGroup key='i' size={size}>
                {PEOPLE.slice(0, 3).map((person) => (
                  <Avatar key={person.name}>
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount>+12</AvatarGroupCount>
              </AvatarGroup>,
              <AvatarGroup key='s' size={size} shape='square'>
                {PEOPLE.slice(0, 3).map((person) => (
                  <Avatar key={person.name}>
                    <AvatarImage src={person.photo} alt={person.name} />
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount>+2</AvatarGroupCount>
              </AvatarGroup>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Usages'>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList>
              {PEOPLE.slice(0, 2).map((person, index) => (
                <Item key={person.name}>
                  <ItemMedia>
                    <Avatar size='2xl'>
                      {index === 0 && <AvatarImage src={person.photo} alt={person.name} />}
                      <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{person.name}</ItemTitle>
                    <ItemDescription>{index === 0 ? 'Owner' : 'Member'}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemList>
          </CardContent>
        </Card>
      </FoundationSection>
    </FoundationPage>
  ),
});
