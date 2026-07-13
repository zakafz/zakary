-- Allow "biweekly" subscription cycle (replaces "weekly").
alter table public.subscriptions
  drop constraint if exists subscriptions_cycle_check;

-- Migrate any existing weekly rows to biweekly before re-adding the constraint.
update public.subscriptions set cycle = 'biweekly' where cycle = 'weekly';

alter table public.subscriptions
  add constraint subscriptions_cycle_check
  check (cycle = any (array['biweekly'::text, 'monthly'::text, 'yearly'::text]));
