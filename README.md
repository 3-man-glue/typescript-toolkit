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
  * run migration `yarn migration:up:local`
  * Noted:
    * init script file on `/cassandra/broadcast.keyspace.dev.cql`
    * logs db on `./data/log/cassandra/<env>`

### Create migration file
  * create file on `/liquibase/changelog` with format
    * `year:month:day:hour:minute-TSC-<jira number>-<what you do>.xml` ex. `20210623110613-TSC-26-create-broadcast-table.xml`
  * changeSet is format
    *  ticket-name + 2 - 3 digit running number + (work-slug optional) ex. `TSC-26-01-create-user-table`
  * author is format
    * `full name <email>`  
  * there is an `template-migration.xml` to use (duplicate and change name)
  * don't forget to include on file `db.cassandra.changelog.xml`