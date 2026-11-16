import { IconDots, IconUsers } from '@tabler/icons-react';
import { useId, useState } from 'react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldLabel } from '~/components/ui/field';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { Slider } from '~/components/ui/slider';

const MEMBERS = [
  {
    name: 'Sarah Kim',
    email: 'sarah@example.com',
    role: 'Admin',
    note: 'Last active 2 hours ago',
    badges: [],
  },
  {
    name: 'Tom Becker',
    email: 'tom@example.com',
    role: 'Member',
    note: 'Invitation sent on March 12, it expires in 5 days unless he accepts it',
    badges: [{ label: 'Invited', intent: 'warning' }],
  },
  {
    name: 'Sebastian Müller-Lüdenscheidt',
    email: 'sebastian.mueller-luedenscheidt@example.com',
    role: 'Owner',
    note: 'Manages billing, the team plan and the access of every member in the workspace',
    badges: [
      { label: 'Owner', intent: 'neutral' },
      { label: 'Active', intent: 'success' },
    ],
  },
] as const;

/**
 * Drag the width. Every row lays out alike: short of room the list truncates the text down to 10rem, then hides every
 * `optional` media, and only then moves the actions of every row to a line of their own.
 */
export function ItemNarrowLists() {
  const [width, setWidth] = useState(360);
  const labelId = useId();
  return (
    <div className='flex w-full flex-col items-start gap-6'>
      <Field className='w-full max-w-80'>
        <div className='flex items-baseline justify-between'>
          <FieldLabel id={labelId}>List width</FieldLabel>
          <span className='text-caption text-muted-foreground tabular-nums'>{width}px</span>
        </div>
        <Slider
          aria-labelledby={labelId}
          value={width}
          onValueChange={(value) => setWidth(value)}
          min={240}
          max={720}
          step={8}
        />
      </Field>
      <Card className='max-w-full' style={{ width }}>
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
                  {member.badges.map((badge) => (
                    <Badge key={badge.label} intent={badge.intent}>
                      {badge.label}
                    </Badge>
                  ))}
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
                <Button size='sm' emphasis='outline'>
                  Manage
                </Button>
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
    </div>
  );
}
