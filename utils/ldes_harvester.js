import { EventStream, newEngine } from "@treecg/actor-init-ldes-client";
import { supabase } from "./supabaseClient.js";
import logger from "./logger.js";

// calculation of yesterday's date
// create a date object using Date constructor
var dateObj = new Date();
var fetchFromStart = new Date();
// subtract one day from current time
dateObj.setDate(dateObj.getDate() - 2);
fetchFromStart.setDate(dateObj.getDate() - 2000);

export function fetchPrivateObjectsLDES() {
  const private_harvest = [];
  const apiKey = process.env.API_KEY_PRIVATE_LDES;
  const options = {};

  try {
    let url =
      "https://apidgdv.gent.be/opendata/eventstream-api-private/v1/dmg/objecten";
    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
        apiKey: apiKey,
      },
      fromTime: new Date(dateObj),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          {
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
            prov: "http://www.w3.org/ns/prov#",
            skos: "http://www.w3.org/2004/02/skos/core#",
            label: "http://www.w3.org/2000/01/rdf-schema#label",
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            "foaf:page": {
              "@type": "@id",
            },
            cest: "https://www.projectcest.be/wiki/Publicatie:Invulboek_objecten/Veld/",
            inhoud:
              "http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content",
            la: "https://linked.art/ns/terms/",
            conforms_to: {
              "@id": "dcterms:conformsTo",
              "@type": "@id",
              "@container": "@set",
            },
            equivalent: {
              "@id": "la:equivalent",
              "@type": "@id",
            },
            dig: "http://www.ics.forth.gr/isl/CRMdig/",
            DigitalObject: {
              "@id": "dig:D1_Digital_Object",
            },
            kwalificatie: {
              "@id": "http://purl.org/ontology/af/confidence",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);
    eventstreamSync.on("data", async (member) => {
      if (options.representation) {
        if (options.representation === "Object") {
          private_harvest.push(member);

          // declare varibles
          let ObjectNumber =
            member["object"]["http://www.w3.org/ns/adms#identifier"][1][
              "skos:notation"
            ]["@value"];

          let _id =
            member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"];

          // check if record already exists in DB

          let data, error;
          try {
            ({ data, error } = await supabase
              .from("dmg_private_objects_LDES")
              .select("*")
              .eq("objectNumber", ObjectNumber));
          } catch (e) {
            logger.error(e);
          }

          // if not: insert member as a new object
          // based on length of array (if 0 = empty)
          if (data && Array.isArray(data) && data.length == 0) {
            logger.info("*-----------------------------------*");
            logger.info("checking: ", ObjectNumber, data.length);
            logger.info("there is no data for: ", _id);

            let insertError;

            try {
              ({ error: insertError } = await supabase
                .from("dmg_private_objects_LDES")
                .insert({
                  LDES_raw: member,
                  objectNumber: ObjectNumber,
                  generated_at_time: member["object"]["prov:generatedAtTime"],
                  is_version_of: _id,
                }));
            } catch (insertError) {
              logger.error(insertError);
            }

            logger.info("data added");
            logger.info("*----------------------------------*");

            // if it does: update member data;
          } else if (data && Array.isArray(data) && data.length > 0) {
            logger.info("*----------------------------------*");
            logger.info("updating: ", ObjectNumber);
            logger.info("*----------------------------------*");

            let { data, error } = await supabase
              .from("dmg_private_objects_LDES")
              .update({
                LDES_raw: member,
                generated_at_time: member["object"]["prov:generatedAtTime"],
              })
              .eq("objectNumber", ObjectNumber);
          }
        } else if (options.representation === "Quads") {
          // insert code here to retrieve Quads data
        }
      }
    });

    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata);
    });

    eventstreamSync.on("pause", () => {
      let state = eventstreamSync.exportState();
    });

    eventstreamSync.on("end", () => {});
    return private_harvest;
  } catch (e) {
    console.error(e);
  }
}

export function fetchObjectLDES() {
  const ldes_harvest = [];
  const options = {};

  try {
    let url =
      "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten";
    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
      },
      fromTime: new Date(dateObj),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          {
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
            prov: "http://www.w3.org/ns/prov#",
            skos: "http://www.w3.org/2004/02/skos/core#",
            label: "http://www.w3.org/2000/01/rdf-schema#label",
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            "foaf:page": {
              "@type": "@id",
            },
            cest: "https://www.projectcest.be/wiki/Publicatie:Invulboek_objecten/Veld/",
            inhoud:
              "http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content",
            la: "https://linked.art/ns/terms/",
            conforms_to: {
              "@id": "dcterms:conformsTo",
              "@type": "@id",
              "@container": "@set",
            },
            equivalent: {
              "@id": "la:equivalent",
              "@type": "@id",
            },
            dig: "http://www.ics.forth.gr/isl/CRMdig/",
            DigitalObject: {
              "@id": "dig:D1_Digital_Object",
            },
            kwalificatie: {
              "@id": "http://purl.org/ontology/af/confidence",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);
    eventstreamSync.on("data", async (member) => {
      if (options.representation) {
        if (options.representation === "Object") {
          //const memberURI = member.id;
          //const object = member.object;
          ldes_harvest.push(member);

          // declare vars
          let _objectNumber =
            member["object"]["http://www.w3.org/ns/adms#identifier"][1][
              "skos:notation"
            ]["@value"];

          let _id =
            member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"];

          // check if object in DB;
          let data, error;
          try {
            ({ data, error } = await supabase
              .from("dmg_objects_LDES")
              .select("*")
              .eq("objectNumber", _objectNumber));
            //logger.info(data);
          } catch (err) {
            error = err;
            logger.info("error: ", error);
          }

          // if not insert new row in supabase
          if (data && Array.isArray(data) && data.length == 0) {
            logger.info("*-----------------------------------*");
            logger.info("checking: ", _objectNumber, data.length);
            logger.info("there is no data for: ", _id);

            let insertError;

            try {
              ({ error: insertError } = await supabase
                .from("dmg_objects_LDES")
                .insert({
                  LDES_raw: member, // add raw LDES data
                  //id: _id, // add id - can't be added! is a unique key.
                  objectNumber: _objectNumber, // add objectnumber
                  generated_at_time: member["object"]["prov:generatedAtTime"], // add version
                  is_version_of: _id, // add pid (same as id)
                }));
            } catch (err) {
              console.error("Insert operation failed:", err);
            }

            logger.info("data added");
            logger.info("*----------------------------------*");

            // if version of the object alread exists, update some values.
          } else if (data && Array.isArray(data) && data.length > 0) {
            logger.info("*----------------------------------*");
            logger.info("updating: ", _objectNumber);
            logger.info("*----------------------------------*");

            let { data, error } = await supabase
              .from("dmg_objects_LDES")
              .update({
                LDES_raw: member,
                generated_at_time: member["object"]["prov:generatedAtTime"],
              })
              .eq("objectNumber", _objectNumber);
          }
        } else if (options.representation === "Quads") {
        }
      } else {
      }

      // Want to pause event stream?
      //eventstreamSync.pause(3000); // pause for 3 seconds
    });
    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata); // logger.info(metadata.treeMetadata) follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
    });
    eventstreamSync.on("pause", () => {
      // Export current state, but only when paused!
      let state = eventstreamSync.exportState();
    });
    eventstreamSync.on("end", () => {
      //logger.info("No more data!");
    });
    return ldes_harvest;
    //logger.info(ldes_harvest);
  } catch (e) {
    console.error(e);
  }
  //logger.info(ldes_harvest.length)
}

export function fetchObjectLDES_OSLO() {
  const ldes_harvest = [];
  const options = {};

  try {
    let url =
      "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/objecten";

    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
      },
      fromTime: new Date(dateObj),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/persoon-basis.jsonld",
          "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/cultureel-erfgoed-event-ap.jsonld",
          "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/cultureel-erfgoed-object-ap.jsonld",
          "https://apidg.gent.be/opendata/adlib2eventstream/v1/context/generiek-basis.jsonld",
          {
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
            prov: "http://www.w3.org/ns/prov#",
            skos: "http://www.w3.org/2004/02/skos/core#",
            label: "http://www.w3.org/2000/01/rdf-schema#label",
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            "foaf:page": {
              "@type": "@id",
            },
            cest: "https://www.projectcest.be/wiki/Publicatie:Invulboek_objecten/Veld/",
            inhoud:
              "http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content",
            la: "https://linked.art/ns/terms/",
            conforms_to: {
              "@id": "dcterms:conformsTo",
              "@type": "@id",
              "@container": "@set",
            },
            equivalent: {
              "@id": "la:equivalent",
              "@type": "@id",
            },
            dig: "http://www.ics.forth.gr/isl/CRMdig/",
            DigitalObject: {
              "@id": "dig:D1_Digital_Object",
            },
            kwalificatie: {
              "@id": "http://purl.org/ontology/af/confidence",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);
    eventstreamSync.on("data", async (member) => {
      if (options.representation) {
        if (options.representation === "Object") {
          const memberURI = member.id;
          //logger.info(memberURI);
          const object = member.object;
          //logger.info(object);
          //logger.info(member);
          ldes_harvest.push(member);
          //logger.info(member["object"]['Stuk.identificator'][1]['skos:notation']['@value'])

          let { data, error } = await supabase
            .from("dmg_objects_LDES")
            .update([
              {
                OSLO: member,
              },
            ])
            .eq(
              "is_version_of",
              member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"],
            );
        } else if (options.representation === "Quads") {
          /* When using Quads representation, the members adhere to the [@Treecg/types Member interface](https://github.com/TREEcg/types/blob/main/lib/Member.ts)
                        interface Member {
                            id: RDF.Term;
                            quads: Array<RDF.Quad>;
                        }
                    */
          const memberURI = member.id.value;
          //logger.info(memberURI);
          const quads = member.quads;
          //logger.info(quads);
        }
      } else {
        //logger.info(member);
      }

      // Want to pause event stream?
      //eventstreamSync.pause();
    });
    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata) logger.info(metadata.treeMetadata); // follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
      //logger.info(metadata.url); // page from where metadata has been extracted
    });
    eventstreamSync.on("pause", () => {
      // Export current state, but only when paused!
      let state = eventstreamSync.exportState();
    });
    eventstreamSync.on("end", () => {
      logger.info("No more data!");
    });
    return ldes_harvest;
    logger.info(ldes_harvest);
  } catch (e) {
    console.error(e);
  }
  //logger.info(ldes_harvest.length)
}

export function fetchThesaurusLDES() {
  const ldes_harvest = [];
  const options = {};

  try {
    let url =
      "https://apidg.gent.be/opendata/adlib2eventstream/v1/adlib/thesaurus";
    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
      },
      fromTime: new Date(dateObj),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          {
            skos: "http://www.w3.org/2004/02/skos/core#",
            "skos:inScheme": {
              "@type": "@id",
            },
            owl: "http://www.w3.org/2002/07/owl#",
            "owl:sameAs": {
              "@type": "@id",
            },
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);
    eventstreamSync.on("data", async (member) => {
      if (options.representation) {
        if (options.representation === "Object") {
          const memberURI = member.id;
          const object = member.object;

          ldes_harvest.push(member);
          logger.info(member["object"]["skos:prefLabel"]["@value"])

          let _id =
            member["object"]["http://purl.org/dc/terms/isVersionOf"][
              "@id"
            ].split("/");

          // check if member is part of thesaurus DMG (priref starts with 53)
          //logger.info('GENERATED AT TIME:' + member["object"]["@id"].split("/")[6])
          //logger.info(member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"])
          //logger.info(member)

          if (_id[5].startsWith("53")) {
            logger.info(_id);
            //logger.info(member);
            // check if object in DB;
            let { data, error } = await supabase
              .from("dmg_thesaurus_LDES")
              .select("*")
              .eq(
                "is_version_of",
                member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"],
              );

            if (data != "") {
              logger.info(
                "there is data for: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              logger.info(
                "updating: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_objects_LDES")
                .update([
                  {
                    LDES_raw: member,
                    generated_at_time: member["object"]["prov:generatedAtTime"],
                    //concept: member["skos:prefLabel"]
                  },
                ])
                .eq(
                  "is_version_of",
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
                );
            } else {
              logger.info(
                "there is no data for: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              logger.info(
                "inserting: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_thesaurus_LDES")
                .insert([
                  {
                    LDES_raw: member,
                    id: _id[5],
                    //objectNumber: member["object"]['http://www.w3.org/ns/adms#identifier'][1]['skos:notation']['@value'],
                    generated_at_time: member["object"]["@id"].split("/")[6],
                    is_version_of:
                      member["object"]["http://purl.org/dc/terms/isVersionOf"][
                        "@id"
                      ],
                  },
                ]);
            }
          }
        } else if (options.representation === "Quads") {
          /* When using Quads representation, the members adhere to the [@Treecg/types Member interface](https://github.com/TREEcg/types/blob/main/lib/Member.ts)
                        interface Member {
                            id: RDF.Term;
                            quads: Array<RDF.Quad>;
                        }
                    */
          const memberURI = member.id.value;
          const quads = member.quads;
        }
      } else {
      }

      // Want to pause event stream?
      //eventstreamSync.pause();
    });
    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata); // logger.info(metadata.treeMetadata) follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
    });
    eventstreamSync.on("pause", () => {
      // Export current state, but only when paused!
      let state = eventstreamSync.exportState();
    });
    eventstreamSync.on("end", () => {
      logger.info("No more data!");
    });
    return ldes_harvest;
    //logger.info(ldes_harvest);
  } catch (e) {
    console.error(e);
  }
  //logger.info(ldes_harvest.length)
}

export function fetchPersonenLDES() {
  const ldes_harvest = [];
  const options = {};

  try {
    let url =
      "https://apidg.gent.be/opendata/adlib2eventstream/v1/adlib/personen";
    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
      },
      fromTime: new Date(dateObj),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          {
            skos: "http://www.w3.org/2004/02/skos/core#",
            "skos:inScheme": {
              "@type": "@id",
            },
            owl: "http://www.w3.org/2002/07/owl#",
            "owl:sameAs": {
              "@type": "@id",
            },
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);
    eventstreamSync.on("data", async (member) => {
      if (options.representation) {
        if (options.representation === "Object") {
          const memberURI = member.id;
          const object = member.object;

          ldes_harvest.push(member);;
          //logger.info(member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"])

          let _id =
            member["object"]["http://purl.org/dc/terms/isVersionOf"][
              "@id"
            ].split("/");

          // check if member is part of thesaurus DMG (priref starts with 53)
          //logger.info('GENERATED AT TIME:' + member["object"]["@id"].split("/")[6])
          //logger.info(member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"])
          //logger.info(member)

          if (_id[5].startsWith("53")) {
            logger.info(_id);
            // check if object in DB;
            let { data, error } = await supabase
              .from("dmg_personen_LDES")
              .select("*")
              .eq(
                "is_version_of",
                member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"],
              );

            if (data != "") {
              logger.info(
                "there is data for: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              logger.info(
                "updating: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_personen_LDES")
                .update([
                  {
                    LDES_raw: member,
                    generated_at_time: member["object"]["prov:generatedAtTime"],
                  },
                ])
                .eq(
                  "is_version_of",
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
                );
            } else {
              logger.info(
                "there is no data for: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              try {
                logger.info(
                  "inserting: " +
                    member["object"]["http://purl.org/dc/terms/isVersionOf"][
                      "@id"
                    ],
                );
                let { data, error } = await supabase
                  .from("dmg_personen_LDES")
                  .insert([
                    {
                      LDES_raw: member,
                      id: _id[5],
                      //objectNumber: member["object"]['http://www.w3.org/ns/adms#identifier'][1]['skos:notation']['@value'],
                      generated_at_time: member["object"]["@id"].split("/")[6],
                      agent_id:
                        member["object"][
                          "http://www.w3.org/ns/adms#identifier"
                        ][1]["skos:notation"]["@value"],
                      is_version_of:
                        member["object"][
                          "http://purl.org/dc/terms/isVersionOf"
                        ]["@id"],
                    },
                  ]);
              } catch (e) {
                logger.info(e);
              }
            }
          }
        } else if (options.representation === "Quads") {
          /* When using Quads representation, the members adhere to the [@Treecg/types Member interface](https://github.com/TREEcg/types/blob/main/lib/Member.ts)
                        interface Member {
                            id: RDF.Term;
                            quads: Array<RDF.Quad>;
                        }
                    */
          const memberURI = member.id.value;
          const quads = member.quads;
        }
      } else {
      }

      // Want to pause event stream?
      //eventstreamSync.pause();
    });
    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata); // logger.info(metadata.treeMetadata) follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
    });
    eventstreamSync.on("pause", () => {
      // Export current state, but only when paused!
      let state = eventstreamSync.exportState();
    });
    eventstreamSync.on("end", () => {
      logger.info("No more data!");
    });
    return ldes_harvest;
    //logger.info(ldes_harvest);
  } catch (e) {
    console.error(e);
  }
  //logger.info(ldes_harvest.length)
}

export function fetchExhibitionLDES() {
  const ldes_harvest = [];
  const options = {};

  try {
    let url =
      "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/tentoonstellingen";
    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
      },
      fromTime: new Date(dateObj),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          {
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
            cidoc: "http://www.cidoc-crm.org/cidoc-crm/",
            prov: "http://www.w3.org/ns/prov#",
            skos: "http://www.w3.org/2004/02/skos/core#",
            label: "http://www.w3.org/2000/01/rdf-schema#label",
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            foaf: "http://xmlns.com/foaf/0.1/",
            "foaf:page": {
              "@type": "@id",
            },
            cest: "https://www.projectcest.be/wiki/Publicatie:Invulboek_objecten/Veld/",
            inhoud:
              "http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content",
            la: "https://linked.art/ns/terms/",
            equivalent: {
              "@id": "la:equivalent",
              "@type": "@id",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);

    try {
      eventstreamSync.on("data", async (member) => {
        if (options.representation) {
          if (options.representation === "Object") {
            const memberURI = member.id;
            const object = member.object;
            ldes_harvest.push(member);

            // check if object in DB;
            let { data, error } = await supabase
              .from("dmg_tentoonstelling_LDES")
              .select("*")
              .eq(
                "id",
                member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"],
              );

            if (data != "") {
              logger.info(
                "updating: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_tentoonstelling_LDES")
                .update([
                  {
                    LDES_raw: member,
                    generated_at_time: member["object"]["prov:generatedAtTime"],
                  },
                ])
                .eq(
                  "is_version_of",
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
                );
            } else {
              logger.info(
                "inserting: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_tentoonstelling_LDES")
                .insert([
                  {
                    LDES_raw: member,
                    id: member["object"][
                      "http://www.w3.org/ns/adms#identifier"
                    ][1]["skos:notation"]["@value"],
                    exh_PID:
                      member["object"][
                        "http://www.w3.org/ns/adms#identifier"
                      ][0]["skos:notation"]["@value"],
                    generated_at_time: member["object"]["prov:generatedAtTime"],
                    is_version_of:
                      member["object"]["http://purl.org/dc/terms/isVersionOf"][
                        "@id"
                      ],
                  },
                ]);
            }
          }
        } else {
        }
      });
    } catch (e) {
      logger.info(e);
    }

    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata); // logger.info(metadata.treeMetadata) follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
    });
    eventstreamSync.on("pause", () => {
      let state = eventstreamSync.exportState();
    });
    eventstreamSync.on("end", () => {
      logger.info("No more data!");
    });
    return ldes_harvest;
  } catch (e) {
    console.error(e);
  }
}

export function fetchArchiveLDES() {
  // function that fetches all publsihed objects in event-stream https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/archief
  const ldes_harvest = [];
  const options = {};

  try {
    let url = "https://apidg.gent.be/opendata/adlib2eventstream/v1/dmg/archief";
    let options = {
      pollingInterval: 5000,
      disablePolling: true,
      representation: "Object",
      mimeType: "application/ld+json",
      requestHeaders: {
        Accept: "application/ld+json",
      },
      fromTime: new Date(fetchFromStart),
      emitMemberOnce: true,
      disableSynchronization: true,
      disableFraming: false,
      jsonLdContext: {
        "@context": [
          {
            la: "https://linked.art/ns/terms/",
            cest: "https://www.projectcest.be/wiki/Publicatie:Invulboek_objecten/Veld/",
            foaf: "http://xmlns.com/foaf/0.1/",
            prov: "http://www.w3.org/ns/prov#",
            skos: "http://www.w3.org/2004/02/skos/core#",
            cidoc: "http://www.cidoc-crm.org/cidoc-crm/",
            label: "http://www.w3.org/2000/01/rdf-schema#label",
            inhoud:
              "http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content",
            "foaf:page": {
              "@type": "@id",
            },
            opmerking: "http://www.w3.org/2004/02/skos/core#note",
            equivalent: {
              "@id": "la:equivalent",
              "@type": "@id",
            },
            "dcterms:isVersionOf": {
              "@type": "@id",
            },
          },
        ],
      },
    };

    let LDESClient = newEngine();
    let eventstreamSync = LDESClient.createReadStream(url, options);

    try {
      eventstreamSync.on("data", async (member) => {
        if (options.representation) {
          if (options.representation === "Object") {
            const memberURI = member.id;
            const object = member.object;
            ldes_harvest.push(member);

            // load image API from manifest

            // check if object in DB;
            let { data, error } = await supabase
              .from("dmg_archief_LDES")
              .select("*")
              .eq(
                "id",
                member["object"]["http://purl.org/dc/terms/isVersionOf"]["@id"],
              );

            if (data !== []) {
              logger.info(
                "updating: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_archief_LDES")
                .update([
                  {
                    LDES_raw: member,
                    generated_at_time: member["object"]["prov:generatedAtTime"],
                  },
                ])
                .eq(
                  "is_version_of",
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
                );
            } else {
              async function load() {
                let url = member["object"]["cidoc:P129i_is_subject_of"]["@id"];
                try {
                  let obj = await (await fetch(url)).json();
                  return obj["sequences"][0]["canvases"][0]["images"][0][
                    "resource"
                  ]["@id"];
                } catch (e) {
                  return "";
                }
              }

              let imageAPI = await load();

              logger.info(
                "inserting: " +
                  member["object"]["http://purl.org/dc/terms/isVersionOf"][
                    "@id"
                  ],
              );
              let { data, error } = await supabase
                .from("dmg_archief_LDES")
                .insert([
                  {
                    LDES_raw: member,
                    objectNumber:
                      member["object"][
                        "http://www.w3.org/ns/adms#identifier"
                      ][1]["skos:notation"]["@value"],
                    generated_at_time: member["object"]["prov:generatedAtTime"],
                    is_version_of:
                      member["object"]["http://purl.org/dc/terms/isVersionOf"][
                        "@id"
                      ],
                    iiif_manifest:
                      member["object"]["cidoc:P129i_is_subject_of"]["@id"],
                    iiif_image: imageAPI,
                  },
                ]);
            }
          }
        } else {
        }
      });
    } catch (e) {
      logger.info(e);
    }

    eventstreamSync.on("metadata", (metadata) => {
      if (metadata.treeMetadata); // logger.info(metadata.treeMetadata) follows the structure of the TREE metadata extractor (https://github.com/TREEcg/tree-metadata-extraction#extracted-metadata)
    });
    eventstreamSync.on("pause", () => {
      let state = eventstreamSync.exportState();
    });
    eventstreamSync.on("end", () => {
      logger.info("No more data!");
    });
    return ldes_harvest;
  } catch (e) {
    console.error(e);
  }
}
