-- Fresh household app. Previous prototype configuration removed per owner request.
-- Run once through Supabase migrations, never automatically on application startup.
do $$ declare t text; n bigint; begin
 foreach t in array array['products','inventory_batches','inventory_movements','shopping_items'] loop
  if to_regclass('public.'||t) is not null then
   execute format('select count(*) from public.%I',t) into n;
   if n<>0 then raise exception 'Refusing to remove populated table %',t; end if;
  end if;
 end loop;
end $$;
drop table if exists public.purchase_session_items,public.purchase_sessions,public.inventory_movements,public.inventory_batches,public.shopping_items,public.notifications,public.audit_records,public.products,public.shelves,public.locations,public.brands,public.categories,public.users,public.households cascade;
drop function if exists public.current_household_id();
drop function if exists public.bump_updated_at();
drop function if exists public.set_shelf_household_id();

create schema if not exists private;
revoke all on schema private from public,anon;
grant usage on schema private to authenticated;
create table private.baulera_members(email text primary key,display_name text not null);
alter table private.baulera_members enable row level security;
-- Populate this allowlist privately after deployment; personal emails do not belong in the repository.

create table private.baulera_state (
 id integer primary key check(id=1),
 document jsonb not null,
 revision bigint not null default 0 check(revision>=0),
 updated_at timestamptz not null default now(),
 updated_by uuid
);
alter table private.baulera_state enable row level security;
insert into private.baulera_state(id,document) values (1,'{"version":1,"lots":[],"shopping":[],"shelves":["Estante 1"],"history":[]}');
create table private.baulera_receipts (
 operation uuid primary key, actor uuid not null, request_hash text not null,
 response jsonb not null, created_at timestamptz not null default now()
);
alter table private.baulera_receipts enable row level security;
revoke all on all tables in schema private from public,anon,authenticated;

-- These privileged helpers stay in a non-exposed schema. Every read/write checks
-- the current verified Auth account against the server-managed allowlist.
create function private.baulera_actor() returns text language sql stable security definer set search_path='' as $$
 select m.display_name from auth.users u join private.baulera_members m on m.email=lower(u.email)
 where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null
$$;

create function private.baulera_valid(d jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare v jsonb; k text;
begin
 if d is null or pg_column_size(d)>2000000 or d->>'version' is distinct from '1' then return false; end if;
 foreach k in array array['lots','shopping','shelves','history'] loop
  if jsonb_typeof(d->k) is distinct from 'array' then return false; end if;
 end loop;
 if jsonb_array_length(d->'lots')>5000 or jsonb_array_length(d->'shopping')>1000 or jsonb_array_length(d->'history')>300 then return false; end if;
 for v in select value from jsonb_array_elements(d->'lots') loop
  foreach k in array array['id','group','brand','size','shelf'] loop
   if jsonb_typeof(v->k) is distinct from 'string' or length(btrim(v->>k)) not between 1 and 120 then return false; end if;
  end loop;
  if jsonb_typeof(v->'category') is distinct from 'string' or length(v->>'category')>120 then return false; end if;
  if jsonb_typeof(v->'expiry') is distinct from 'string' or (v->>'expiry'<>'' and v->>'expiry' !~ '^\d{4}-\d{2}(-\d{2})?$') then return false; end if;
  foreach k in array array['b','h'] loop
   if jsonb_typeof(v->k) is distinct from 'number' or (v->>k) !~ '^\d{1,4}$' then return false; end if;
  end loop;
  if not (d->'shelves' ? (v->>'shelf')) then return false; end if;
 end loop;
 if exists(select 1 from jsonb_array_elements(d->'lots') l group by l->>'id' having count(*)>1) then return false; end if;
 for v in select value from jsonb_array_elements(d->'shopping') loop
  if jsonb_typeof(v->'group') is distinct from 'string' or length(btrim(v->>'group')) not between 1 and 120 or v->>'source' not in ('auto','manual') or jsonb_typeof(v->'bought') is distinct from 'boolean' then return false; end if;
 end loop;
 if exists(select 1 from jsonb_array_elements(d->'shopping') l group by lower(btrim(l->>'group')) having count(*)>1) then return false; end if;
 for v in select value from jsonb_array_elements(d->'shelves') loop
  if jsonb_typeof(v) is distinct from 'string' or length(btrim(v#>>'{}')) not between 1 and 120 then return false; end if;
 end loop;
 for v in select value from jsonb_array_elements(d->'history') loop
  foreach k in array array['id','at','actor','label'] loop
   if jsonb_typeof(v->k) is distinct from 'string' or length(v->>k)>500 then return false; end if;
  end loop;
 end loop;
 return true;
end $$;
alter table private.baulera_state add constraint valid_inventory check(private.baulera_valid(document));

create function private.baulera_read() returns jsonb language plpgsql security definer set search_path='' as $$
declare s private.baulera_state;
begin
 if auth.uid() is null or private.baulera_actor() is null then raise exception 'Acceso reservado para los integrantes de esta despensa.' using errcode='42501'; end if;
 select * into strict s from private.baulera_state where id=1;
 return jsonb_build_object('document',s.document,'revision',s.revision,'updated_at',s.updated_at,'updated_by',s.updated_by);
end $$;

create function private.baulera_commit(p_revision bigint,p_operation uuid,p_document jsonb,p_label text) returns jsonb language plpgsql security definer set search_path='' as $$
declare s private.baulera_state; r private.baulera_receipts; result jsonb; actor_name text; fingerprint text;
begin
 actor_name:=private.baulera_actor();
 if auth.uid() is null or actor_name is null then raise exception 'Acceso reservado para los integrantes de esta despensa.' using errcode='42501'; end if;
 if p_operation is null or p_revision is null or p_revision<0 or p_label is null or length(p_label)>500 or not private.baulera_valid(p_document) then raise exception 'Datos de inventario no válidos.' using errcode='22023'; end if;
 fingerprint:=md5(p_document::text||p_revision::text||p_label);
 -- Serialize before checking receipts: concurrent retries must observe the first commit.
 select * into strict s from private.baulera_state where id=1 for update;
 select * into r from private.baulera_receipts where operation=p_operation;
 if found then
  if r.actor<>auth.uid() or r.request_hash<>fingerprint then raise exception 'La operación ya existe con otros datos.' using errcode='22023'; end if;
  return r.response;
 end if;
 if s.revision<>p_revision then return jsonb_build_object('status','conflict','snapshot',private.baulera_read()); end if;
 if p_document#>>'{history,0,id}' is distinct from p_operation::text then raise exception 'Falta el movimiento.' using errcode='22023'; end if;
 p_document:=jsonb_set(p_document,'{history,0,actor}',to_jsonb(actor_name));
 p_document:=jsonb_set(p_document,'{history,0,label}',to_jsonb(p_label));
 update private.baulera_state set document=p_document,revision=revision+1,updated_at=now(),updated_by=auth.uid() where id=1;
 result:=jsonb_build_object('status','ok','snapshot',private.baulera_read());
 insert into private.baulera_receipts(operation,actor,request_hash,response) values(p_operation,auth.uid(),fingerprint,result);
 return result;
end $$;

revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.baulera_read() to authenticated;
grant execute on function private.baulera_commit(bigint,uuid,jsonb,text) to authenticated;
create function public.baulera_read() returns jsonb language sql security invoker set search_path='' as $$select private.baulera_read()$$;
create function public.baulera_commit(p_revision bigint,p_operation uuid,p_document jsonb,p_label text) returns jsonb language sql security invoker set search_path='' as $$select private.baulera_commit(p_revision,p_operation,p_document,p_label)$$;
revoke all on function public.baulera_read() from public,anon;
revoke all on function public.baulera_commit(bigint,uuid,jsonb,text) from public,anon;
grant execute on function public.baulera_read() to authenticated;
grant execute on function public.baulera_commit(bigint,uuid,jsonb,text) to authenticated;
notify pgrst,'reload schema';
