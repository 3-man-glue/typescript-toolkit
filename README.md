# ts-http-toolkit

TypeScript template components for backend HTTP/S application

#### Run Cassandra database local
  * required `docker, docker-compose`
  * please make sure you have `APP_ENV` key on .env (or copy `.env.example` to `.env`)
  * run `yarn start db:local`
  * test access to db
    * run `docker exec -it cassandra /bin/bash`
    * run `cqlsh -u cassandra -p cassandra`
      * default db username is `cassandra`, password is `cassandra`
    * run `use broadcast;` to access `broadcast` keyspace
    * run `desc tables;` to see all table
  * Noted:
    * init script file on `/cassandra/schema.cql`
    * logs db on `./data/log/cassandra/<env>`