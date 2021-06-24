CREATE KEYSPACE IF NOT EXISTS broadcast
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1 };
