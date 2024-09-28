export class CloudflareDNSUpdater {

  private static async fetchZoneId(config: CloudflareDnsUpdaterConfig): Promise<string> {
    console.log(`Fetching Zone ID for domain ${config.domain}...`);

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${config.domain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    const zoneId = data.result?.[0]?.id;

    if (!zoneId) {
      throw new Error(`Unable to retrieve Zone ID for ${config.domain}.`);
    }

    console.log(`Zone ID for ${config.domain}: ${zoneId}`);
    return zoneId;
  }


  private static async fetchDnsRecordId(zoneId: string, config: CloudflareDnsUpdaterConfig): Promise<string> {
    console.log(`Fetching DNS Record ID for subdomain ${config.subdomain}...`);

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${config.subdomain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();

    const dnsRecordId = data.result?.[0]?.id;

    if (!dnsRecordId) {
      throw new Error(`Unable to retrieve DNS Record ID for ${config.subdomain}.`);
    }

    console.log(`DNS Record ID for ${config.subdomain}: ${dnsRecordId}`);
    return dnsRecordId;
  }


  private static async updateDnsRecord(zoneId: string, dnsRecordId: string, config: CloudflareDnsUpdaterConfig): Promise<void> {
    console.log(`Updating IP address of ${config.subdomain} to ${config.newIp}...`);

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${dnsRecordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'A',
        name: config.subdomain,
        content: config.newIp,
        ttl: config.ttl
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`Successfully updated the IP address of ${config.subdomain} to ${config.newIp}.`);
    } else {
      console.error('Failed to update DNS record.', data);
      throw new Error('Failed to update DNS record.');
    }
  }


  static async updateDns(config: CloudflareDnsUpdaterConfig): Promise<void> {
    try {
      const zoneId = await this.fetchZoneId(config);
      const dnsRecordId = await this.fetchDnsRecordId(zoneId, config);
      await this.updateDnsRecord(zoneId, dnsRecordId, config);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}


export interface CloudflareDnsUpdaterConfig {
  apiToken: string,
  domain: string,
  subdomain: string,
  newIp: string,
  ttl: number,
}