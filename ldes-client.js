import {
  fetchObjectLDES,
  fetchThesaurusLDES,
  fetchPersonenLDES,
  fetchExhibitionLDES,
  fetchArchiveLDES,
  fetchPrivateObjectsLDES,
} from "./utils/ldes_harvester.js";

import cron from "node-cron";
import logger from "./utils/logger.js";

function main() {
  logger.info("----------------------------------------------------------");
  logger.info("                 start sync LDES-postGres                 ");
  logger.info("----------------------------------------------------------");

  try {
    logger.info("fetching human made objects");
    fetchObjectLDES()

    logger.info("fetching thesaurus");
    fetchThesaurusLDES();

    logger.info("fetching exhibition");
    fetchExhibitionLDES();

    logger.info("fetching agents");
    fetchPersonenLDES();

    fetchArchiveLDES();
    logger.info("done harvesting LDES");

    fetchPrivateObjectsLDES();
    logger.info("done fetching private objects");


  } catch (e) {
    logger.error(e);
  }
}

main()