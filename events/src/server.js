const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  process.stdout.write(`Event locator backend running on port ${port}\n`);
});
