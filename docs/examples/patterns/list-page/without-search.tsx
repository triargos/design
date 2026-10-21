import { IconDots, IconPlus } from '@tabler/icons-react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Sarah Kim', email: 'sarah@example.com', role: 'Admin' },
  { name: 'Tom Becker', email: 'tom@example.com', role: 'Member' },
  { name: 'Lea Schmidt', email: 'lea@example.com', role: 'Owner' },
] as const;

/**
 * Without search, the add action moves into the header row, centered on the title and description (`items-center`),
 * inset by the shell's 4px (`me-1`) to the card's edge. No toolbar row.
 */
export function ListPageWithoutSearch() {
  return (
    <div className='flex w-full max-w-3xl flex-col gap-page'>
      <header className='flex flex-wrap items-center justify-between gap-group'>
        <hgroup className='flex flex-col gap-tight'>
          <h1 className='text-title text-balance'>Members</h1>
          <p className='max-w-prose text-body text-pretty text-muted-foreground'>
            Everyone with access to this workspace.
          </p>
        </hgroup>
        <Button intent='primary' className='me-1'>
          <IconPlus data-icon='inline-start' />
          Invite member
        </Button>
      </header>
      <Card>
        <CardContent className='overflow-hidden'>
          <ItemList aria-label='Members'>
            {MEMBERS.map((member) => (
              <Item key={member.email}>
                <ItemMedia>
                  <Avatar size='2xl'>
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{member.name}</ItemTitle>
                  <ItemDescription>
                    {member.role} · {member.email}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button emphasis='ghost' size='icon-xs' aria-label={`Actions for ${member.name}`}>
                    <IconDots />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemList>
        </CardContent>
      </Card>
    </div>
  );
}
