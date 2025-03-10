import { promises as dnsPromises } from 'dns';
import dns from 'dns';

export class IpResolver {

  static async getIPAddressOfLanName(host: string): Promise<string | undefined> {
    try {
      console.log(`Resolving IP for ${host}`)
      const addresses = await dnsPromises.lookup(host);
      return addresses.address;
    } catch (error) {
      console.error(`Failed to resolve host: ${error}`);
      return undefined;
    }
  }


  static getIPAddressOfDomainName(domain: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      console.log(`Resolving IP for ${domain}`)
      dns.resolve4(domain, (err, addresses) => {
        if (err) {
          console.error(`Failed to get address for ${domain}`, err)
          resolve(undefined);
        } else {
          resolve(addresses[0]);
        }
      });
    });
  }


  static async getExternalPublicIpAddress(): Promise<string | undefined> {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data: { ip: string } = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
    }
  }
}
