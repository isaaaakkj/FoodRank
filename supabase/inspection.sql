-- Somente leitura. Executar antes de decidir qualquer alteração remota.
select table_schema, table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (table_name ilike '%restaurant%' or table_name ilike '%cache%')
order by table_name, ordinal_position;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and (tablename ilike '%restaurant%' or tablename ilike '%cache%');

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and (table_name ilike '%restaurant%' or table_name ilike '%cache%')
order by table_name, grantee, privilege_type;
