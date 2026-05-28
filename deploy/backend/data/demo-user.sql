-- GUEST ACCOUNT
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = 'demo@nutriai.local';

  if v_user_id is null then
    raise exception 'User dengan email % belum ada di auth.users', 'demo@nutriai.local';
  end if;

  insert into public.profiles (user_id, email, name, bio, goal, budget, age, weight, height, activity)
  values (
    v_user_id,
    'demo@nutriai.local',
    'Demo User',
    'Mencintai meal prep sehat dan menu tinggi protein.',
    'Jaga Kesehatan',
    15000,
    25,
    65,
    165,
    'Sedang'
  )
  on conflict (user_id) do update
    set email = excluded.email,
        name = excluded.name,
        bio = excluded.bio,
        goal = excluded.goal,
        budget = excluded.budget,
        age = excluded.age,
        weight = excluded.weight,
        height = excluded.height,
        activity = excluded.activity;

  insert into public.saved_menus (user_id, menu_id)
  values (v_user_id, 1)
  on conflict do nothing;

  insert into public.optimizer_results (user_id, result)
  values (
    v_user_id,
    jsonb_build_object('budget', 10000, 'target', 2000, 'protein', 90)
  );
end $$;