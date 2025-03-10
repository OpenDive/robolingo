import { config } from './env';

// Override configuration for tests
config.db = {
  host: ':memory:',
  port: 0,
  name: 'test',
  user: 'test',
  password: 'test',
  dialect: 'sqlite'
};

config.logLevel = 'silent'; 