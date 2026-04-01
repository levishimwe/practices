const app = require('./app');
const { port } = require('./config/env');
const { sequelize } = require('./config/db');
require('./models');

async function bootstrap() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  app.listen(port, () => {
    process.stdout.write(`Event locator backend running on port ${port}\n`);
  });
}

bootstrap().catch((error) => {
  process.stderr.write(`Failed to start server: ${error.message}\n`);
  process.exit(1);
});
