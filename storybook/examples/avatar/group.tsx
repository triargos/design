import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  getInitials,
} from '~/components/ui/avatar';

/** An inline SVG portrait, so the example needs no network. */
const portrait = (background: string, figure: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='${background}'/><circle cx='20' cy='16' r='7' fill='${figure}'/><rect x='8' y='26' width='24' height='16' rx='8' fill='${figure}'/></svg>`,
  )}`;

const PEOPLE = [
  { name: 'Mia Schmidt', photo: portrait('#fde68a', '#d97706') },
  { name: 'Leon Weber', photo: portrait('#c7d2fe', '#6366f1') },
  { name: 'Emma Fischer', photo: portrait('#bbf7d0', '#16a34a') },
  { name: 'Paul Wagner', photo: portrait('#fecdd3', '#e11d48') },
] as const;

/** Each avatar is cut out of the one before it, so the gap reads on any surface. A count pill takes the rest. */
export function AvatarGroupExample() {
  return (
    <AvatarGroup size='xl'>
      {PEOPLE.map((person) => (
        <Avatar key={person.name}>
          <AvatarImage src={person.photo} alt={person.name} />
          <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+12</AvatarGroupCount>
    </AvatarGroup>
  );
}
