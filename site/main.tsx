import { createRoot, hydrateRoot } from 'react-dom/client';

import '~/inter.css';
import './styles.css';
import { loadPage, pageAt } from './page';
import { Root } from './root';

const container = document.getElementById('root')!;
const pathname = window.location.pathname;

// Prerendered HTML hydrates once its page's chunk is in, so hydration never falls back to the skeleton. `vite dev` serves
// the empty shell: render from scratch.
const page = pageAt(pathname);
if (page !== undefined) await loadPage(page);

if (container.hasChildNodes()) hydrateRoot(container, <Root pathname={pathname} />);
else createRoot(container).render(<Root pathname={pathname} />);
