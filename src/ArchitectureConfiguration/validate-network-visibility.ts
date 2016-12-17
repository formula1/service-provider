import { IServiceConfig } from "../Service/Config";

function validateNetworkVisibility(config: IServiceConfig, oconfigs: Array<IServiceConfig>) {
  oconfigs.forEach(function(oconfig){
    if (oconfig.public === "EXTERNAL") {
      throw "Only Available externally";
    }
    if (oconfig.public === "SELF") {
      if (oconfig.folder !== config.folder) {
        throw "Only Available by its direct peer services";
      }
    }
  });
}

export default validateNetworkVisibility;
