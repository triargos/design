import { IconDots, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '~/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Sarah Kim', email: 'sarah@example.com', role: 'Admin' },
  { name: 'Tom Becker', email: 'tom@example.com', role: 'Member' },
  { name: 'Lea Schmidt', email: 'lea@example.com', role: 'Owner' },
  { name: 'Jonas Weber', email: 'jonas@example.com', role: 'Member' },
] as const;

const matches = (query: string) => (member: (typeof MEMBERS)[number]) =>
  `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(query.trim().toLowerCase());

/**
 * A page of one list: the title, then a toolbar `group` above the card with the search on the left and the add action
 * on the right. The toolbar is inset by the shell's 4px (`px-1`), so field and button line up with the card's edge. In
 * light mode the field takes the card fill (`bg-card`); dark mode keeps the field's own fill. A query with no match
 * shows an `Empty` that clears it; so does Escape.
 */
export function ListPageDefault() {
  const [query, setQuery] = useState('');
  const shown = MEMBERS.filter(matches(query));
  return (
    <div className='flex w-full max-w-3xl flex-col gap-page'>
      <hgroup className='flex flex-col gap-tight'>
        <h1 className='text-title text-balance'>Members</h1>
        <p className='max-w-prose text-body text-pretty text-muted-foreground'>
          Everyone with access to this workspace.
        </p>
      </hgroup>
      <div className='flex flex-col gap-group'>
        <div className='flex flex-wrap items-center justify-between gap-related px-1'>
          <InputGroup className='bg-card sm:max-w-xs'>
            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
              placeholder='Search by name, email or role'
              aria-label='Search members'
            />
            {query !== '' && (
              <InputGroupAddon align='inline-end'>
                <InputGroupButton size='icon-xs' aria-label='Clear search' onClick={() => setQuery('')}>
                  <IconX />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button intent='primary'>
            <IconPlus data-icon='inline-start' />
            Invite member
          </Button>
        </div>
        <Card>
          <CardContent className='overflow-hidden'>
            {shown.length > 0 ? (
              <ItemList aria-label='Members'>
                {shown.map((member) => (
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
                      <Button emphasis='ghost' size='icon-sm' aria-label={`Actions for ${member.name}`}>
                        <IconDots />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemList>
            ) : (
              <Empty size='sm'>
                <EmptyMedia variant='icon'>
                  <IconSearch />
                </EmptyMedia>
                <EmptyTitle>No members match “{query.trim()}”</EmptyTitle>
                <EmptyDescription>Check the spelling, or search by email.</EmptyDescription>
                <EmptyContent>
                  <Button size='sm' onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
