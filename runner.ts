import { CloudflareDNSUpdater } from "./cloudflare-dns-updater";
import { IpResolver } from "./ip-address-resolver";


export class Runner {

  static async run(configs: CloudflareConfig[]) {
    for (const singleConfig of configs) {
      let lastUpdated: Date;
      if (await this.runOnce(singleConfig))
        lastUpdated = new Date()

      let updateIntervalMs = singleConfig.updateIntervalSeconds * 1000;
      setInterval(async () => {
        let updatedSecondsAgo: number | undefined;
        if (lastUpdated)
          updatedSecondsAgo = (Date.now() - lastUpdated.getTime()) / 1000

        if (!updatedSecondsAgo || updatedSecondsAgo > singleConfig.ttl) {
          if (await this.runOnce(singleConfig))
            lastUpdated = new Date()
        } else {
          console.log(`${singleConfig.fullSubDomainName} was updated ${updatedSecondsAgo.toFixed(0)}s ago, waiting until TTL of ${singleConfig.ttl}s expires to recheck.`)
        }
      }, updateIntervalMs);

    }
  }


  private static async runOnce(config: CloudflareConfig): Promise<boolean> {
    let start = Date.now();
    let updated = await this.tryUpdate(config);
    let remainingSeconds = config.updateIntervalSeconds - ((Date.now() - start) / 1000)
    console.log(`Waiting ${remainingSeconds.toFixed(0)}s to try recheck ${config.fullSubDomainName}`)
    return updated;
  }


  /** Returns true of the DNS record is actually updated */
  private static async tryUpdate(config: CloudflareConfig): Promise<boolean> {
    console.log(`Running updater for ${config.fullSubDomainName}`);

    const host = config.lanHostName;;
    const lanIpAddress = await IpResolver.getIPAddressOfLanName(host);

    let updated = false;
    if (lanIpAddress) {
      console.log(`LAN IP address of ${host}: ${lanIpAddress}`);

      let currentDnsIpAddress = await IpResolver.getIPAddressOfDomainName(config.fullSubDomainName)
      console.log(`Current DNS IP address for ${config.fullSubDomainName} : ${currentDnsIpAddress}`)
      if (currentDnsIpAddress !== lanIpAddress) {
        console.log(`LAN IP ${lanIpAddress} differs from DNS IP ${currentDnsIpAddress}`)

        try {
          await CloudflareDNSUpdater.updateDns({
            apiToken: config.cloudflareApiToken,
            domain: config.domainName,
            subdomain: config.fullSubDomainName,
            newIp: lanIpAddress,
            ttl: config.ttl,
          })
          console.log('DNS update completed.')
          updated = true;
        } catch (error) {
          console.error('Error during DNS update:', error)
        }
      } else {
        console.log(`LAN IP ${lanIpAddress} same as DNS IP ${currentDnsIpAddress}`)
      }

    } else {
      console.log(`Could not resolve the IP address of ${host}`);
    }

    return updated;
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

