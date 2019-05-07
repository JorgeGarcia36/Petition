DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS usersProfiles;
DROP TABLE IF EXISTS usersTable;

CREATE TABLE signatures (
  id SERIAL primary key,
  signature TEXT not null,
  userId INTEGER not null
);

CREATE TABLE usersTable (
  id SERIAL primary key,
  firstname VARCHAR(255) not null,
  lastname VARCHAR(255) not null,
  email VARCHAR(255) not null unique,
  password VARCHAR(100) not null
);


CREATE TABLE usersProfiles(
id SERIAL PRIMARY KEY,
age INTEGER,
city VARCHAR(100),
url VARCHAR(300),
userId INTEGER REFERENCES usersTable(id) NOT NULL UNIQUE
);
