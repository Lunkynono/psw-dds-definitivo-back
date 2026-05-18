alter table if exists public.proyecto
  add column if not exists archivo_url text,
  add column if not exists archivo_nombre text,
  add column if not exists archivo_tipo text,
  add column if not exists archivo_tamano bigint,
  add column if not exists archivo_path text;

grant select, insert, update, delete on table public.proyecto to service_role;

insert into storage.buckets (id, name, public, file_size_limit)
values ('proyectos', 'proyectos', true, 20971520)
on conflict (id) do update
set public = true,
    file_size_limit = 20971520;
