/* Take a CSV with initial data for the 'OC Status' and generate a
 * the basic json files for it
 */
'use strict';

var csv = require('csv');
var fs = require('fs-extra');

var exportDir = './export';

function checkEmpty (value) {
  if (value === '') {
    return undefined;
  } else {
    return value;
  }
}

function checkBool (value) {
  if (value.toLowerCase() === 'x') {
    return true;
  } else {
    return false;
  }
}

var parser = csv.parse({columns: true}, function (err, data) {
  if (err) return console.error(err);
  for (var i in data) {
    if (data[i].iso) {
      var countryJSON = {
        iso: data[i].iso.toLowerCase(),
        name: data[i].country_simple,
        full_name: data[i].country,
        meta: {},
        results: {
          godi_score: checkEmpty(data[i].godi_score),
          godi_link: checkEmpty(data[i].godi_link),
          innovations: [],
          ocds_historic_data: checkBool(data[i].ocds_historic_data),
          ocds_ongoing_data: checkBool(data[i].ocds_ongoing_data),
          ocds_implementation: checkBool(data[i].ocds_implementation),
          ocds_description: checkEmpty(data[i].ocds_description),
          websites: [],
          ogp_commitments: [],
          citizen_monitoring: checkBool(data[i].citizen_monitoring),
          commitment_oil_mining: checkEmpty(data[i].commitment_oil_mining.toLowerCase()),
          commitment_oil_mining_description: checkEmpty(data[i].commitment_description),
          commitment_oil_mining_link: checkEmpty(data[i].commitment_oil_mining_link),
          disclosure_oil_mining: checkEmpty(data[i].disclosure_oil_mining.toLowerCase()),
          disclosure_oil_mining_description: checkEmpty(data[i].disclosure_description),
          disclosure_oil_mining_link: checkEmpty(data[i].disclosure_oil_mining_link)
        }
      };
      if (checkEmpty(data[i].innovation_description) || checkEmpty(data[i].innovation_link)) {
        countryJSON.results.innovations.push({
          innovation_description: checkEmpty(data[i].innovation_description),
          innovation_link: checkEmpty(data[i].innovation_link)
        });
      }
      if (checkEmpty(data[i].ogp_commitment) || checkEmpty(data[i].ogp_commitment_link)) {
        countryJSON.results.ogp_commitments.push({
          ogp_commitment: checkEmpty(data[i].ogp_commitment),
          ogp_commitment_link: checkEmpty(data[i].ogp_commitment_link)
        });
      }
      if (checkEmpty(data[i].website_link) || checkEmpty(data[i].publisher)) {
        countryJSON.results.websites.push({
          website_link: checkEmpty(data[i].website_link),
          publisher: checkEmpty(data[i].publisher)
        });
      }
      fs.writeFile(`${exportDir}/${data[i].iso.toLowerCase()}.json`, JSON.stringify(countryJSON));
    }
  }
});

fs.emptyDir(exportDir, function (err) {
  if (err) return console.log(err);
});

fs.createReadStream('./oc-status-initial-data.csv').pipe(parser);
