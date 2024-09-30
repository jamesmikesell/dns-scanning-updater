# DNS Scanning Updater

Container to check the LAN IP address of hosts on a network, and if necessary update their subdomain DNS record on Cloudflare. Useful for situations where a device on a network isn't capable of running something like `ddclient` to update a dns record for itself.


### Usage:
1. create a config file `config.json` with the following format
    ```json
    {
      "cloudflareUpdater": [
        {
          "cloudflareApiToken": "put token here",
          "domainName": "example.com",
          "fullSubDomainName": "my-mac.example.com",
          "ttl": 600,
          "lanHostName": "my-mac-book.local",
          "updateIntervalSeconds": 60
        },
        {
          "cloudflareApiToken": "put token here",
          "domainName": "example.com",
          "fullSubDomainName": "their-pc.example.com",
          "ttl": 600,
          "lanHostName": "their-windows-pc.lan",
          "updateIntervalSeconds": 60
        }
      ]
    }
    ```
1. run the following
    ```
    docker run --restart unless-stopped -d --name dns-updater --network=host -v $(pwd)/config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater
    ```


### Updating Config
1. Update the config file
1. If the container is still running, no further action is needed



### Updating to Latest Version
1. Update the config file
1. Run 
    ```
    docker container stop dns-updater
    docker container rm dns-updater
    docker pull ghcr.io/jamesmikesell/dns-scanning-updater
    docker run --restart unless-stopped -d --name dns-updater -v $(pwd)/config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater
    ```