-- Add user_phone column and allow 'requested' in status check constraint

alter table public.railquick_train_requests
  add column if not exists user_phone text check (user_phone is null or char_length(user_phone) <= 30);

alter table public.railquick_train_requests
  drop constraint if exists railquick_train_requests_status_check;

alter table public.railquick_train_requests
  add constraint railquick_train_requests_status_check
  check (status in ('pending', 'requested', 'reviewing', 'approved', 'rejected'));

-- Update column grants for authenticated if needed
grant insert (user_id, user_name, user_phone, user_email, train_name, train_number, journey_date, status)
  on public.railquick_train_requests to authenticated;
