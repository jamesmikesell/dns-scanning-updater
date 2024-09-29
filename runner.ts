import { Config } from "./config";
import { Synchronizer } from "./synchronizer";


export class Runner {

  private synchronizers = new Map<string, Synchronizer>();

  constructor() {
    this.schedule();
  }


  schedule() {
    console.log("Refreshing synchronizers")
    let config = Config.currentConfig
    if (config) {
      let currentConfigFileSubDomains = new Set<string>();

      config.cloudflareUpdater.forEach(single => {
        let subDomain = single.fullSubDomainName;
        currentConfigFileSubDomains.add(subDomain);
        if (!this.synchronizers.has(subDomain)) {
          console.log(`Creating synchronizer for ${subDomain}`)
          this.synchronizers.set(subDomain, new Synchronizer(subDomain))
        }
      })

      Array.from(this.synchronizers.keys())
        .forEach(singleRunningSynchronizerSubDomain => {
          if (!currentConfigFileSubDomains.has(singleRunningSynchronizerSubDomain)) {
            console.log(`Synchronizer no longer needed for for ${singleRunningSynchronizerSubDomain}`)
            let synchronizer = this.synchronizers.get(singleRunningSynchronizerSubDomain);
            synchronizer?.dispose();
            this.synchronizers.delete(singleRunningSynchronizerSubDomain);
          }
        })

    }

    setTimeout(() => this.schedule(), 60 * 1000);
  }

}
