import { promises as dnsPromises } from 'dns';
import dns from 'dns';

export class IpResolver {

  static async getIPAddressOfLanName(host: string): Promise<string | null> {
    try {
      console.log(`Resolving IP for ${host}`)
      const addresses = await dnsPromises.lookup(host);
      return addresses.address;
    } catch (error) {
      console.error(`Failed to resolve host: ${error}`);
      return null;
    }
  }


  static getIPAddressOfDomainName(domain: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`Resolving IP for ${domain}`)
      dns.resolve4(domain, (err, addresses) => {
        if (err) {
          reject(err);
        } else {
          resolve(addresses[0]);
        }
      });
    });
  }
}
