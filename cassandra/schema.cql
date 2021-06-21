CREATE KEYSPACE IF NOT EXISTS broadcast
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1 };

USE broadcast;

create table if not exists user
(
    created_year_month int,
    user_id uuid,
    created_time timestamp,
    primary key ( (created_year_month), created_time, user_id)
)with clustering order by (created_time desc);

create table if not exists broadcast
(
    broadcast_id           uuid,
    broadcast_year_hour    int,
    broadcast_at           timestamp,
    message                varchar,
    target_segments        set<uuid>,
    type                   varchar,
    status                 varchar,
    open_count             int,
    is_tracking_open_count boolean,
    open_count_date        timestamp,
    primary key ((broadcast_id), broadcast_at, broadcast_year_hour)
) with clustering order by (broadcast_at desc);

create materialized view if not exists broadcast_by_year_hour as
select *
from broadcast
where broadcast_id is not null
  and broadcast_at is not null
  and broadcast_year_hour is not null
primary key ( (broadcast_year_hour), broadcast_at, broadcast_id )
        with clustering order by (broadcast_at desc);

create table if not exists segment
(
    segment_id uuid,
    segment_name varchar,
    created_at timestamp,
    user_count int,
    primary key (segment_name)
);

create table if not exists segment_user
(
    segment_id uuid,
    user_id uuid,
    added_order timeuuid,
    primary key ( (segment_id), added_order)
) with clustering order by (added_order desc);

create table if not exists broadcast_batch
(
    broadcast_batch_id uuid,
    broadcast_id uuid,
    status varchar,
    created_time timestamp,
    primary key ( (broadcast_id), broadcast_batch_id, created_time )
) with clustering order by (broadcast_batch_id asc, created_time desc);

create table if not exists broadcast_batch_user
(
    broadcast_id       uuid,
    broadcast_batch_id uuid,
    user_id            varchar,
    hash               varchar,
    primary key ((broadcast_batch_id), hash)
);
