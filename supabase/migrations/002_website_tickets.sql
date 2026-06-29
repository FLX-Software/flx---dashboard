-- Website-Ticket-Felder für Integration mit flx-software.de
alter table public.support_tickets
  add column if not exists external_ticket_id text,
  add column if not exists customer_company text,
  add column if not exists customer_phone text,
  add column if not exists source text not null default 'manual'
    check (source in ('website', 'manual'));

create unique index if not exists idx_tickets_external_id
  on public.support_tickets (external_ticket_id)
  where external_ticket_id is not null;
