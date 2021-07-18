import dotenv from 'dotenv'
import { Service } from 'typedi'

type CassandraConfig = {
  username: string
  password: string
  keyspace: string
  dataCenter: string
  contactPoints: string[]
}

interface ConfigInterface {
  cassandra: CassandraConfig
}

@Service()
export class ConfigService implements ConfigInterface {
  public readonly cassandra: Readonly<CassandraConfig>

  constructor() {
    if (process.env['APP_ENV'] === 'dev') {
      dotenv.config({
        path: '.env.example',
      })
    } else {
      dotenv.config()
    }

    this.cassandra = {
      username: process.env['DATABASE_CASSANDRA_USERNAME'] ?? '',
      password: process.env['DATABASE_CASSANDRA_PASSWORD'] ?? '',
      keyspace: process.env['DATABASE_CASSANDRA_KEYSPACE'] ?? '',
      dataCenter: process.env['DATABASE_CASSANDRA_DATA_CENTER'] ?? '',
      contactPoints: ( process.env['DATABASE_CASSANDRA_CONTACT_POINTS'] ?? '' ).split(','),
    }
  }
}
