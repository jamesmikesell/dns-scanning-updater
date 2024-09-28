import { CloudflareDNSUpdater } from "./cloudflare-dns-updater";
import { IpResolver } from "./ip-address-resolver";


export class Runner {

  static async run(configs: CloudflareConfig[]) {
    for (const singleConfig of configs) {
      setInterval(() => {
        void this.runOnce(singleConfig)
      }, singleConfig.updateIntervalSeconds * 1000);

      void this.runOnce(singleConfig)
    }
  }


  private static async runOnce(config: CloudflareConfig): Promise<void> {
    let start = Date.now();
    await this.tryUpdate(config);
    let remainingSeconds = config.updateIntervalSeconds - ((Date.now() - start) / 1000)
    console.log(`Waiting ${remainingSeconds.toFixed(0)}s to try updating ${config.fullSubDomainName} again`)
  }

  private static async tryUpdate(config: CloudflareConfig) {
    console.log(`Running updater for ${config.fullSubDomainName}`);

    const host = config.lanHostName;;
    const lanIpAddress = await IpResolver.getIPAddressOfLanName(host);

    if (lanIpAddress) {
      console.log(`LAN IP address of ${host}: ${lanIpAddress}`);

      let currentDnsIpAddress = await IpResolver.getIPAddressOfDomainName(config.fullSubDomainName)
      console.log(`Current DNS IP address for ${config.fullSubDomainName} : ${currentDnsIpAddress}`)
      if (currentDnsIpAddress !== lanIpAddress) {
        console.log(`LAN IP ${lanIpAddress} differs from DNS IP ${currentDnsIpAddress}`)

        CloudflareDNSUpdater.updateDns({
          apiToken: config.cloudflareApiToken,
          domain: config.domainName,
          subdomain: config.fullSubDomainName,
          newIp: lanIpAddress,
          ttl: config.ttl,
        }).then(() => console.log('DNS update completed.'))
          .catch(err => console.error('Error during DNS update:', err));
      } else {
        console.log(`LAN IP ${lanIpAddress} same as DNS IP ${currentDnsIpAddress}`)
      }

    } else {
      console.log(`Could not resolve the IP address of ${host}`);
    }
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

