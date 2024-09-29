# DNS Scanning Updater

Container to check the LAN IP address of hosts on a network, and if necessary update their subdomain DNS record on Cloudflare. Useful for situations where a device on a network isn't capable of running something like `ddclient` to update a dns record for itself.


### Usage:
1. create a config file `config.json`  (see `sample-config.json` for config layout)
1. run the following
    ```
    docker run --restart unless-stopped -d --name dns-updater -v $(pwd)/config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater
    ```


### Updating Config
1. Update the config file
1. Run 
    ```
    docker container restart dns-updater
    ```


### Updating to Latest Version
1. Update the config file
1. Run 
    ```
    docker container stop dns-updater
    docker container rm dns-updater
    docker pull ghcr.io/jamesmikesell/dns-scanning-updater
    docker run --restart unless-stopped -d --name dns-updater -v $(pwd)/config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater
    ```