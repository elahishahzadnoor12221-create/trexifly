-- Trexifly Phase 1: run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.alert_contacts (
 id uuid primary key default gen_random_uuid(),
 name text not null, agency text, type text not null check(type in ('client','agent')),
 email text not null, whatsapp text not null, city text, language text not null default 'en',
 interests text[] not null default '{}', email_consent boolean not null default false,
 whatsapp_consent boolean not null default false, email_consent_at timestamptz,
 whatsapp_consent_at timestamptz, consent_source text, notes text,
 unsubscribed boolean not null default false, unsubscribed_at timestamptz,
 unsubscribe_token_hash text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint alert_contacts_language check(language in ('en','ur','ar'))
);
create unique index if not exists alert_contacts_email_lower_uq on public.alert_contacts(lower(email));
create unique index if not exists alert_contacts_whatsapp_uq on public.alert_contacts(whatsapp);
create index if not exists alert_contacts_audience_idx on public.alert_contacts(type,unsubscribed);
create table if not exists public.alert_campaigns (
 id uuid primary key default gen_random_uuid(), mode text not null check(mode in ('client','agent')),
 subject text not null, status text not null, recipient_count integer not null default 0,
 sent_count integer not null default 0, failed_count integer not null default 0,
 created_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.alert_campaign_messages (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.alert_campaigns(id) on delete cascade,
 contact_id uuid not null references public.alert_contacts(id), channel text not null,
 status text not null, sent_at timestamptz, created_at timestamptz not null default now(),
 unique(campaign_id,contact_id,channel)
);
create table if not exists public.alert_whatsapp_status (
 id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.alert_contacts(id) on delete cascade,
 status text not null check(status in ('sent','not_sent')), updated_at timestamptz not null default now()
);
create table if not exists public.alert_rate_limits (
 key text primary key, window_started_at timestamptz not null, hits integer not null
);
create or replace function public.consume_alert_rate_limit(p_key text,p_max integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare allowed boolean;
begin
 insert into alert_rate_limits(key,window_started_at,hits) values(p_key,now(),1)
 on conflict(key) do update set
 window_started_at=case when alert_rate_limits.window_started_at < now() - make_interval(secs=>p_window_seconds) then now() else alert_rate_limits.window_started_at end,
 hits=case when alert_rate_limits.window_started_at < now() - make_interval(secs=>p_window_seconds) then 1 else alert_rate_limits.hits+1 end;
 select hits<=p_max into allowed from alert_rate_limits where key=p_key;
 return allowed;
end; $$;
revoke all on function public.consume_alert_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_alert_rate_limit(text,integer,integer) to service_role;
alter table public.alert_contacts enable row level security;
alter table public.alert_campaigns enable row level security;
alter table public.alert_campaign_messages enable row level security;
alter table public.alert_whatsapp_status enable row level security;
alter table public.alert_rate_limits enable row level security;
-- No anon/authenticated policies: access is server-side only via service_role.

create table if not exists public.alert_unsubscribe_tokens (
 id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.alert_contacts(id) on delete cascade,
 token_hash text not null unique, created_at timestamptz not null default now(), used_at timestamptz
);
create index if not exists alert_unsubscribe_tokens_contact_idx on public.alert_unsubscribe_tokens(contact_id);
create unique index if not exists alert_whatsapp_status_contact_uq on public.alert_whatsapp_status(contact_id);
alter table public.alert_unsubscribe_tokens enable row level security;

-- Atomic CSV deduplication/upsert. Preserves an existing unsubscribe and never grants
-- marketing consent unless that channel is explicitly consented on the incoming row.
create or replace function public.upsert_alert_contacts(p_contacts jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  item record;
  existing public.alert_contacts%rowtype;
  match_count integer;
  created_count integer := 0;
  updated_count integer := 0;
begin
  if jsonb_typeof(p_contacts) <> 'array' then
    raise exception 'p_contacts must be a JSON array';
  end if;
  for item in
    select * from jsonb_to_recordset(p_contacts) as x(
      name text, agency text, type text, email text, whatsapp text, city text,
      language text, interests text[], email_consent boolean, whatsapp_consent boolean,
      email_consent_at timestamptz, whatsapp_consent_at timestamptz,
      consent_source text, notes text
    )
  loop
    select count(*) into match_count from public.alert_contacts
      where lower(email)=lower(item.email) or whatsapp=item.whatsapp;
    if match_count > 1 then
      raise exception 'Multiple existing contacts match email/WhatsApp; reconcile duplicates before import';
    end if;
    select * into existing from public.alert_contacts
      where lower(email)=lower(item.email) or whatsapp=item.whatsapp
      order by created_at asc limit 1 for update;
    if found then
      update public.alert_contacts set
        name=item.name, agency=item.agency, type=item.type, email=lower(item.email),
        whatsapp=item.whatsapp, city=item.city, language=coalesce(item.language,'en'),
        interests=coalesce(item.interests,'{}'::text[]),
        email_consent=case when existing.unsubscribed then false else (existing.email_consent or coalesce(item.email_consent,false)) end,
        whatsapp_consent=case when existing.unsubscribed then false else (existing.whatsapp_consent or coalesce(item.whatsapp_consent,false)) end,
        email_consent_at=case when existing.unsubscribed then null when existing.email_consent then existing.email_consent_at else item.email_consent_at end,
        whatsapp_consent_at=case when existing.unsubscribed then null when existing.whatsapp_consent then existing.whatsapp_consent_at else item.whatsapp_consent_at end,
        consent_source=coalesce(item.consent_source,existing.consent_source),
        notes=coalesce(item.notes,existing.notes),
        updated_at=now()
      where id=existing.id;
      updated_count := updated_count + 1;
    else
      insert into public.alert_contacts(
        name,agency,type,email,whatsapp,city,language,interests,email_consent,whatsapp_consent,
        email_consent_at,whatsapp_consent_at,consent_source,notes
      ) values (
        item.name,item.agency,coalesce(item.type,'agent'),lower(item.email),item.whatsapp,item.city,
        coalesce(item.language,'en'),coalesce(item.interests,'{}'::text[]),
        coalesce(item.email_consent,false),coalesce(item.whatsapp_consent,false),
        item.email_consent_at,item.whatsapp_consent_at,item.consent_source,item.notes
      );
      created_count := created_count + 1;
    end if;
  end loop;
  return jsonb_build_object('created',created_count,'updated',updated_count);
end; $$;
revoke all on function public.upsert_alert_contacts(jsonb) from public,anon,authenticated;
grant execute on function public.upsert_alert_contacts(jsonb) to service_role;


-- Backend table privileges (required in addition to RLS bypass).
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
