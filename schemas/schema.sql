drop table if exists `entry`;
create table `entry` (
  id integer primary key autoincrement,
  title text not null,
  subtitle text not null,
  intro text not null,
  body text not null,
  timestamp integer not null
);
