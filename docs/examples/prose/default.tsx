import { Card, CardContent } from '~/components/ui/card';
import { Prose } from '~/components/ui/prose';

/** An announcement as the editor saved it: headings, lists, a link, code, a quote and a rule. */
export function ProseDefault() {
  return (
    <Card className='w-full max-w-xl'>
      <CardContent className='p-card'>
        <Prose>
          <h1>Workspace update: March</h1>
          <p>
            Projects now have <strong>due dates</strong> and a weekly digest. Everything below is live for every member
            of the workspace.
          </p>
          <h2>What changed</h2>
          <ul>
            <li>Tasks show their project and owner in every list.</li>
            <li>
              Invoices export as CSV from <a href='#billing'>Billing</a>.
            </li>
            <li>
              Archived projects move to a separate tab:
              <ul>
                <li>They keep their tasks and documents.</li>
                <li>Only owners can restore them.</li>
              </ul>
            </li>
          </ul>
          <h3>For admins</h3>
          <ol>
            <li>Open Settings › Members.</li>
            <li>
              Set the role to <code>billing</code> for whoever sends invoices.
            </li>
          </ol>
          <blockquote>
            <p>The digest replaced three separate emails for us. — Lena, Design</p>
          </blockquote>
          <hr />
          <p>Questions? Reply to this announcement and the team will get back to you.</p>
        </Prose>
      </CardContent>
    </Card>
  );
}
