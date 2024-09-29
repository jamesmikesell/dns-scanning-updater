import { CloudflareDNSUpdater } from "./cloudflare-dns-updater";
import { CloudflareConfig, Config } from "./config";
import { IpResolver } from "./ip-address-resolver";


export class Synchronizer {

  private disposed = false;
  private currentSchedule: NodeJS.Timeout | undefined;


  constructor(private subDomain: string) {
    this.updateScheduler(0);
  }


  dispose(): void {
    console.log(`Disposing ${this.subDomain}`)
    this.disposed = true;
    if (this.currentSchedule)
      clearTimeout(this.currentSchedule)
  }


  private updateScheduler(delaySeconds: number): void {
    console.log(`Waiting ${delaySeconds.toFixed(0)}s to try recheck ${this.subDomain}`)

    this.currentSchedule = setTimeout(async () => {
      let config = this.getConfig();
      if (this.disposed || !config) {
        console.log(`${this.subDomain} disposed, exiting`)
        return;
      }

      let updated = await this.tryUpdate(config);
      if (updated) {
        console.log(`Updated, waiting for TTL to expire before rechecking ${config.fullSubDomainName}`)
        this.updateScheduler(config.ttl)
      } else {
        this.updateScheduler(config.updateIntervalSeconds)
      }
    }, delaySeconds * 1000);
  }


  private getConfig(): CloudflareConfig | undefined {
    return Config.currentConfig
      ?.cloudflareUpdater
      .find(singleConfig => singleConfig.fullSubDomainName === this.subDomain)
  }


  /** Returns true of the DNS record is actually updated */
  private async tryUpdate(config: CloudflareConfig): Promise<boolean> {
    console.log(`Running updater for ${config.fullSubDomainName}`);

    const host = config.lanHostName;;
    const lanIpAddress = await IpResolver.getIPAddressOfLanName(host);

    let updated = false;
    if (lanIpAddress) {
      console.log(`LAN IP address of ${host}: ${lanIpAddress}`);

      let currentDnsIpAddress = await IpResolver.getIPAddressOfDomainName(config.fullSubDomainName)
      console.log(`Current DNS IP address for ${config.fullSubDomainName} : ${currentDnsIpAddress}`)

      if (!currentDnsIpAddress)
        return false;

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