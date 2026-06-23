drop policy if exists "messages_insert_own" on public.messages;

create policy "messages_insert_own"
    on public.messages for insert
    with check (
        auth.uid() = user_id
        and exists (
            select 1
            from public.conversations c
            where c.id = conversation_id
            and c.user_id = auth.uid()
        )
    );