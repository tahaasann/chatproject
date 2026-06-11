-- DreamAI - conversations table (messages + RLS in follow-up commits)

create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    title text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_updated_at_idx on public.conversations (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
    before update on public.conversations
    for each row execute function public.set_updated_at();


-- ------------------------------------------------------
-- messages
-- ------------------------------------------------------
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);