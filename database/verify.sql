-- Transactional integration test. All fixtures and inventory writes are rolled back.
begin;
select set_config('baulera.test_uid',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
values(current_setting('baulera.test_uid')::uuid,'authenticated','authenticated','test-'||current_setting('baulera.test_uid')||'@example.invalid',now(),'{}','{}');
insert into private.baulera_members values('test-'||current_setting('baulera.test_uid')||'@example.invalid','Integration test');
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('baulera.test_uid'),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare base jsonb; doc jsonb; first_result jsonb; result jsonb; op uuid:=gen_random_uuid(); op2 uuid:=gen_random_uuid(); rev bigint;
begin
 base:=public.baulera_read();rev:=(base->>'revision')::bigint;doc:=base->'document';
 doc:=jsonb_set(doc,'{history}',jsonb_build_array(jsonb_build_object('id',op,'at',now(),'actor','client label','label','integration check')));
 first_result:=public.baulera_commit(rev,op,doc,'integration check');
 if first_result->>'status'<>'ok' or (first_result#>>'{snapshot,revision}')::bigint<>rev+1 then raise exception 'commit failed';end if;
 if first_result#>>'{snapshot,document,history,0,actor}'<>'Integration test' then raise exception 'actor not authenticated';end if;
 result:=public.baulera_commit(rev,op,doc,'integration check');
 if result<>first_result then raise exception 'retry not idempotent';end if;
 result:=public.baulera_commit(rev,op2,jsonb_set(doc,'{history,0,id}',to_jsonb(op2::text)),'integration check');
 if result->>'status'<>'conflict' then raise exception 'stale revision was accepted';end if;
 begin perform public.baulera_commit(rev,op,doc,'changed payload');raise exception 'operation ID reuse was accepted';exception when invalid_parameter_value then null;end;
 begin perform public.baulera_commit(rev+1,op2,'{"version":1,"lots":[{"b":-1}],"shopping":[],"shelves":[],"history":[]}', 'invalid');raise exception 'invalid document accepted';exception when invalid_parameter_value then null;end;
 if has_table_privilege(current_user,'private.baulera_state','UPDATE') or has_table_privilege(current_user,'private.baulera_members','SELECT') then raise exception 'direct table access';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',gen_random_uuid(),'role','authenticated')::text,true);
 begin perform public.baulera_read();raise exception 'unknown user accepted';exception when insufficient_privilege then null;end;
 if has_function_privilege('anon','public.baulera_read()','EXECUTE') then raise exception 'anonymous access';end if;
end $$;
reset role;
rollback;
select 'PASS: access control, private tables, validated writes, CAS conflicts, authenticated actor, idempotent retries; all fixtures rolled back' as verification;
