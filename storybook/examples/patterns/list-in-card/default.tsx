import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  {
    name: 'Erika Mustermann',
    email: 'erika@schule.de',
    role: 'Sekretariat',
    status: { label: 'Aktiv', intent: 'success' },
  },
  {
    name: 'Max Mustermann',
    email: 'max@schule.de',
    role: 'Lehrkraft',
    status: { label: 'Eingeladen', intent: 'warning' },
  },
  { name: 'Lea Schmidt', email: 'lea@schule.de', role: 'Schulleitung', status: { label: 'Aktiv', intent: 'success' } },
] as const;

/**
 * Every list on a page: `InsetCardContent className='overflow-hidden'` around an `ItemList`. The header holds the
 * add action; each row ends in a status and a ghost menu, on one column with the header action.
 */
export function ListInCardDefault() {
  return (
    <InsetCard className='w-full max-w-2xl'>
      <InsetCardHeader
        actions={
          <Button type='button' intent='neutral' emphasis='ghost' size='xs'>
            <PlusIcon data-icon='inline-start' />
            Einladen
          </Button>
        }>
        <InsetCardTitle>Mitglieder</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
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
                <Badge intent={member.status.intent}>{member.status.label}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type='button'
                        intent='neutral'
                        emphasis='ghost'
                        size='icon-xs'
                        aria-label={`Aktionen für ${member.name}`}
                      />
                    }>
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <PencilIcon />
                      Rolle ändern
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem intent='destructive'>
                      <Trash2Icon />
                      Entfernen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemActions>
            </Item>
          ))}
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
