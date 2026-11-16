import { IconDots, IconUsers } from '@tabler/icons-react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

import { PhoneFrame } from '../../kit/phone-frame';

const PHONES = [
  { label: '360px · small Android', className: 'w-[360px]' },
  { label: '440px · large iPhone', className: 'w-[440px]' },
];

const MEMBERS = [
  {
    name: 'Sarah Kim',
    email: 'sarah@example.com',
    role: 'Admin',
    note: 'Last active 2 hours ago',
    status: { label: 'Active', intent: 'success' },
  },
  {
    name: 'Tom Becker',
    email: 'tom@example.com',
    role: 'Member',
    note: 'Invitation sent on March 12, it expires in 5 days unless he accepts it',
    status: { label: 'Invited', intent: 'warning' },
  },
  {
    name: 'Sebastian Müller-Lüdenscheidt',
    email: 'sebastian.mueller-luedenscheidt@example.com',
    role: 'Owner',
    note: 'Manages billing, the team plan and the access of every member in the workspace',
    status: { label: 'Active', intent: 'success' },
  },
] as const;

function Members() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemList>
          {MEMBERS.map((member) => (
            <Item key={member.email}>
              <ItemMedia optional>
                <Avatar size='2xl'>
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{member.name}</ItemTitle>
                <ItemDescription>
                  {member.role} · {member.email} · {member.note}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge intent={member.status.intent}>{member.status.label}</Badge>
                <Button emphasis='ghost' size='icon-sm' aria-label={`Actions for ${member.name}`}>
                  <IconDots />
                </Button>
              </ItemActions>
            </Item>
          ))}
          <Item>
            <ItemMedia variant='icon' optional>
              <IconUsers />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Website team</ItemTitle>
              <ItemDescription>
                Group · 12 members · Can edit the website redesign project and its files
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge>Group</Badge>
              <Button emphasis='ghost' size='icon-sm' aria-label='Actions for Website team'>
                <IconDots />
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Access request</ItemTitle>
              <ItemDescription>
                Lea Schmidt asks for editor access to the website redesign project and its files
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size='sm' emphasis='outline'>
                Decline
              </Button>
              <Button size='sm'>Approve</Button>
            </ItemActions>
          </Item>
        </ItemList>
      </CardContent>
    </Card>
  );
}

/** A members card on a small and a large phone, each with a 16px page gutter. */
export function ItemOnAPhone() {
  return (
    <div className='flex flex-wrap items-start gap-6'>
      {PHONES.map((phone) => (
        <div key={phone.label} className='flex flex-col gap-2'>
          <span className='text-caption text-muted-foreground'>{phone.label}</span>
          <PhoneFrame className={`${phone.className} h-auto p-4`}>
            <Members />
          </PhoneFrame>
        </div>
      ))}
    </div>
  );
}
