create table if not exists black_lists (
  id binary (12) not null,
  created_at datetime not null default current_timestamp(),
  domain varchar(255) unique not null,

  primary key (id)
);
