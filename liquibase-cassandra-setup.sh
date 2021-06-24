CASSANDRA_EXTENSION=./liquibase/libs/liquibase-cassandra-4.3.5.jar
CASSANDRA_DRIVER=./liquibase/libs/CassandraJDBC42.jar
if [ ! -f "$CASSANDRA_EXTENSION" ]; then
  wget -P ./liquibase/libs https://github.com/liquibase/liquibase-cassandra/releases/download/liquibase-cassandra-4.3.5/liquibase-cassandra-4.3.5.jar
fi
if [ ! -f "$CASSANDRA_DRIVER" ]; then
  wget https://downloads.datastax.com/jdbc/cql/2.0.4.1004/SimbaCassandraJDBC42-2.0.4.1004.zip && unzip SimbaCassandraJDBC42-2.0.4.1004.zip -d ./liquibase/libs && rm SimbaCassandraJDBC42-2.0.4.1004.zip
fi
