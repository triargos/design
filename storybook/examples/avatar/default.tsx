import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

/** An inline SVG portrait, so the example needs no network. */
const portrait = (background: string, figure: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='${background}'/><circle cx='20' cy='16' r='7' fill='${figure}'/><rect x='8' y='26' width='24' height='16' rx='8' fill='${figure}'/></svg>`,
  )}`;

export function AvatarDefault() {
  return (
    <Avatar size='2xl'>
      <AvatarImage src={portrait('#fde68a', '#d97706')} alt='Mia Schmidt' />
      <AvatarFallback>MS</AvatarFallback>
    </Avatar>
  );
}
