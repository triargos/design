import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, foundationSection, matrix, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Avatar from '../pavo/avatar.ts';
import * as Card from '../pavo/card.ts';
import { icon } from '../pavo/icon.ts';
import * as Item from '../pavo/item.ts';

export const title = 'Avatar';
export const description = 'A person or an organization: their photo, or their initials.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

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
] as const;

const portrait = (background: string, figure: string): string =>
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

const GROUP_NAMES = ['Lena Park', 'Omar Haddad', 'Sofia Rossi'] as const;

type Person = (typeof PEOPLE)[number];

const withPhoto = (person: Person): Avatar.AvatarContent<Message> => ({
  image: { src: person.photo, alt: person.name },
  fallback: [Avatar.initials(person.name)],
});

const initialsOnly = (name: string): Avatar.AvatarContent<Message> => ({ fallback: [Avatar.initials(name)] });

const check = (): Html => icon('check');

const sizeMatrix = (h: HtmlBuilder<Message>): Html =>
  matrix(
    ['image', 'initials', 'square', 'badge'],
    SIZES.map(({ size, px }) => ({
      name: size,
      meta: code(`${px}px`, h),
      cells: [
        Avatar.view({ size, ...withPhoto(PEOPLE[0]) }, h),
        Avatar.view({ size, ...initialsOnly(PEOPLE[4].name) }, h),
        Avatar.view({ size, shape: 'square', ...initialsOnly('Northwind Studio') }, h),
        Avatar.view({ size, ...withPhoto(PEOPLE[2]), badge: [check()] }, h),
      ],
    })),
    h,
  );

const groupMatrix = (h: HtmlBuilder<Message>): Html =>
  matrix(
    ['photos', 'initials', 'square'],
    (['sm', 'md', 'xl', '2xl'] as const).map((size) => ({
      name: size,
      cells: [
        Avatar.group({ size, avatars: PEOPLE.map(withPhoto) }, h),
        Avatar.group({ size, avatars: PEOPLE.slice(0, 3).map((person) => initialsOnly(person.name)), count: '+12' }, h),
        Avatar.group({ size, shape: 'square', avatars: PEOPLE.slice(0, 3).map(withPhoto), count: '+2' }, h),
      ],
    })),
    h,
  );

const usages = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      children: [
        Card.header({ children: [Card.title({ children: ['Members'] }, h)] }, h),
        Card.content(
          {
            className: 'overflow-hidden',
            children: [
              Item.list(
                {
                  children: PEOPLE.slice(0, 2).map((person, index) =>
                    Item.view(
                      {
                        children: [
                          Item.media(
                            {
                              children: [
                                Avatar.view(
                                  { size: '2xl', ...(index === 0 ? withPhoto(person) : initialsOnly(person.name)) },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Item.content(
                            {
                              children: [
                                Item.title({ children: [person.name] }, h),
                                Item.description({ children: [index === 0 ? 'Owner' : 'Member'] }, h),
                              ],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description:
        'A person or an organization: their photo, or their initials on a quiet fill. A hairline inside the edge keeps a photo off the surface behind it.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            children: [
              Avatar.view({ size: '2xl', image: { src: PEOPLE[0].photo, alt: PEOPLE[0].name }, fallback: ['LP'] }, h),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Group',
            description:
              'Each avatar is cut out of the one before it, so the gap reads on any surface. A count pill takes the rest.',
            children: [Avatar.group({ size: 'xl', avatars: PEOPLE.slice(0, 4).map(withPhoto), count: '+12' }, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Sizes',
            description: '12 to 80px.',
            children: [
              h.div(
                [h.Class('flex flex-wrap items-end gap-3')],
                SIZES.map(({ size }) => Avatar.view({ size, fallback: ['LP'] }, h)),
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Group sizes',
            children: [
              h.div(
                [h.Class('flex flex-col items-start gap-3')],
                (['sm', 'md', 'xl', '2xl'] as const).map((size) =>
                  Avatar.group({ size, avatars: GROUP_NAMES.map(initialsOnly), count: '+4' }, h),
                ),
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Shapes',
            description: 'Round for people, square for organizations.',
            children: [
              h.div(
                [h.Class('flex flex-wrap items-center gap-4')],
                [
                  Avatar.view({ size: '2xl', ...initialsOnly('Lena Park') }, h),
                  Avatar.view({ size: '2xl', shape: 'square', ...initialsOnly('Northwind Studio') }, h),
                  Avatar.group(
                    {
                      size: 'xl',
                      shape: 'square',
                      avatars: [initialsOnly('Northwind Studio'), initialsOnly('Acme Labs')],
                      count: '+2',
                    },
                    h,
                  ),
                ],
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Fallback',
            description: 'Initials on a quiet fill when there is no photo or it fails to load.',
            children: [
              h.div(
                [h.Class('flex items-center gap-4')],
                [
                  Avatar.view({ size: '2xl', ...initialsOnly('Mary-Kate van der Berg') }, h),
                  Avatar.view({ size: '2xl', ...initialsOnly('Sofia Rossi'), badge: [check()] }, h),
                ],
              ),
            ],
          },
          h,
        ),
        foundationSection({ title: 'Size × content', children: [sizeMatrix(h)] }, h),
        foundationSection(
          {
            title: 'Group × size',
            description:
              'Each avatar is cut out of the one before it, so the gap reads on any surface. A count pill takes the rest.',
            children: [groupMatrix(h)],
          },
          h,
        ),
        foundationSection({ title: 'Usages', children: [usages(h)] }, h),
      ],
    },
    h,
  ),
);
