/*
  # Create increment_athlete_stat function

  A utility RPC function to safely increment a numeric column on the athletes table.

  ## Function: increment_athlete_stat
  - Parameters:
    - athlete_id (uuid): The target athlete's ID
    - field (text): The column name to increment
  - Behavior: Uses COALESCE so NULL columns are treated as 0 before incrementing
  - Uses parameterized dynamic SQL to prevent SQL injection on the column name
*/

create or replace function increment_athlete_stat(
  athlete_id uuid,
  field text
)
returns void as $$
begin
  execute format(
    'update athletes set %I = coalesce(%I, 0) + 1 where id = $1',
    field, field
  )
  using athlete_id;
end;
$$ language plpgsql;
