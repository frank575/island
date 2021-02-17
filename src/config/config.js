const config = {
  env: 'dev',
  db: {
    dbname: 'island',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
  },
  pass: [
    'v1/user/register',
    'v1/user/login',
  ]
}

module.exports = config
