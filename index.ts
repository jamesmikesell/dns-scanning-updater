import * as fs from 'fs';
import { ConfigFile, Runner } from './runner';


function shutdown() {
  console.log('Received shutdown signal, cleaning up...');
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


const data = fs.readFileSync("./config.json", { encoding: 'utf8' });
const configFile: ConfigFile = JSON.parse(data);

Runner.run(configFile.cloudflareUpdater);

