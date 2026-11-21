-- Trexifly diagnostics: run in the SAME Supabase project used by Trexifly.
select
  current_database() as database_name,
  current_user as sql_editor_user,
  has_table_privilege('service_role', 'public.alert_contacts', 'SELECT') as service_role_can_select_alert_contacts,
  has_table_privilege('service_role', 'public.alert_campaigns', 'SELECT') as service_role_can_select_alert_campaigns,
  has_table_privilege('service_role', 'public.alert_campaign_messages', 'SELECT') as service_role_can_select_alert_campaign_messages,
  has_table_privilege('service_role', 'public.alert_whatsapp_status', 'SELECT') as service_role_can_select_alert_whatsapp_status,
  has_table_privilege('service_role', 'public.alert_rate_limits', 'SELECT') as service_role_can_select_alert_rate_limits,
  has_table_privilege('service_role', 'public.alert_unsubscribe_tokens', 'SELECT') as service_role_can_select_alert_unsubscribe_tokens;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee = 'service_role'
  and table_name in (
    'alert_contacts',
    'alert_campaigns',
    'alert_campaign_messages',
    'alert_whatsapp_status',
    'alert_rate_limits',
    'alert_unsubscribe_tokens'
  )
order by table_name, privilege_type;
