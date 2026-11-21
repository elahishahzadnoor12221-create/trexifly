-- Trexifly Phase 1: grant backend service_role access to the six alert tables.
-- Run once in Supabase SQL Editor for project nnwllnazhnggftflksxk.

grant usage on schema public to service_role;

grant select, insert, update, delete
on table
  public.alert_contacts,
  public.alert_campaigns,
  public.alert_campaign_messages,
  public.alert_whatsapp_status,
  public.alert_rate_limits,
  public.alert_unsubscribe_tokens
to service_role;

-- Reassert execution rights for the server-only RPCs.
grant execute on function public.consume_alert_rate_limit(text, integer, integer) to service_role;
grant execute on function public.upsert_alert_contacts(jsonb) to service_role;
