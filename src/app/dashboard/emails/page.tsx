import { EmailInbox } from "@/components/emails/email-inbox";
import { fetchEmails } from "@/lib/email";

export default async function EmailsPage() {
  const { emails, demo, mailbox, error } = await fetchEmails();

  return (
    <EmailInbox
      initialEmails={emails}
      demo={demo}
      mailbox={mailbox}
      error={error}
    />
  );
}
