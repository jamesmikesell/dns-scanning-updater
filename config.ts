import * as fs from 'fs';


export class Config {
  static currentConfig: ConfigFile | undefined;

  constructor() {
    this.scheduleConfigUpdater();
  }


  private scheduleConfigUpdater(): void {
    console.log("Updating config from config file");
    const data = fs.readFileSync("./config.json", { encoding: 'utf8' });
    Config.currentConfig = JSON.parse(data);

    setTimeout(() => this.scheduleConfigUpdater(), 60 * 1000);
  }
}



export interface ConfigFile {
  cloudflareUpdater: CloudflareConfig[],
}


export interface CloudflareConfig {
  cloudflareApiToken: string,
  domainName: string,
  fullSubDomainName: string,
  ttl: number,
  lanHostName: string,
  updateIntervalSeconds: number,
}

