const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('studygram', 'root', '', { host: 'localhost', dialect: 'mysql' });
sequelize.query("ALTER TABLE posts MODIFY COLUMN visibility ENUM('public', 'registered', 'followers', 'private') DEFAULT 'public'")
  .then(() => { console.log('success'); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
