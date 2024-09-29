import { Config } from './config';
import { Runner } from './runner';


function shutdown() {
  console.log('Received shutdown signal, cleaning up...');
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


new Config()
new Runner()

