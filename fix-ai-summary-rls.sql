begin;

alter table public.proyecto_resumen_ia enable row level security;

drop policy if exists proyecto_resumen_ia_backend_select on public.proyecto_resumen_ia;
drop policy if exists proyecto_resumen_ia_backend_insert on public.proyecto_resumen_ia;
drop policy if exists proyecto_resumen_ia_backend_update on public.proyecto_resumen_ia;
drop policy if exists proyecto_resumen_ia_backend_delete on public.proyecto_resumen_ia;

create policy proyecto_resumen_ia_backend_select
  on public.proyecto_resumen_ia
  for select
  to anon, authenticated, service_role
  using (true);

create policy proyecto_resumen_ia_backend_insert
  on public.proyecto_resumen_ia
  for insert
  to anon, authenticated, service_role
  with check (true);

create policy proyecto_resumen_ia_backend_update
  on public.proyecto_resumen_ia
  for update
  to anon, authenticated, service_role
  using (true)
  with check (true);

create policy proyecto_resumen_ia_backend_delete
  on public.proyecto_resumen_ia
  for delete
  to anon, authenticated, service_role
  using (true);

grant select, insert, update, delete on table public.proyecto_resumen_ia to anon, authenticated, service_role;
grant usage, select on sequence public.proyecto_resumen_ia_id_seq to anon, authenticated, service_role;

commit;
