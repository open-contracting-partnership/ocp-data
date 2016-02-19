'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var mapData = require('./lib/ne_110m_admin_0_countries.json');

// Merge all individual countries from the OC Status survey in one file
var sourceDir = './data/oc-status';
var targetDir = './dist/oc-status';
var mergedFile = 'all.json';
var tableFile = 'table.json';
var mapFile = 'map.json';
var mergedData = [];

var tableData = {
  meta: {
    display: [
      {
        key: 'country',
        value: 'Country'
      },
      {
        key: 'ocds_data',
        value: 'Publishing OCDS data'
      },
      {
        key: 'ocds_implementation',
        value: 'OCDS implementation'
      },
      {
        key: 'ogp_commitment',
        value: 'Relevant OGP commitment'
      }
    ]
  },
  data: []
};

function processOCDS (countryData) {
  if (countryData.results.ocds_historic_data && countryData.results.ocds_ongoing_data) {
    return 'Historic and ongoing';
  } else if (countryData.results.ocds_historic_data) {
    return 'Historic';
  } else if (countryData.results.ocds_ongoing_data) {
    return 'Ongoing';
  } else {
    return 'No';
  }
}

function prepTableData (countryData) {
  var d = {
    country: countryData.name,
    ocds_data: processOCDS(countryData),
    ocds_implementation: countryData.results.ocds_implementation ? 'Yes' : 'No'
  };
  if (countryData.results.ogp_commitments[0]) {
    d.ogp_commitment = countryData.results.ogp_commitments[0].ogp_commitment !== '' || null ? 'Yes' : 'No';
  }
  return d;
}

async.waterfall([
  function (callback) {
    // Write the original data files
    fs.copy(sourceDir, targetDir, function (err) {
      callback(err);
    });
  },
  function (callback) {
    // Load all the country files and merge them in one array
    fs.readdir(sourceDir, function (err, list) {
      for (var f in list) {
        var path = `${sourceDir}/${list[f]}`;
        var contents = fs.readFileSync(path);
        var jsonData = JSON.parse(contents);

        var i = _.findIndex(mapData.features, function (o) { return o.properties.iso_a2.toLowerCase() === jsonData.iso; });
        if (i !== -1) {
          _.merge(mapData.features[i].properties, jsonData.results);
        }

        tableData.data.push(prepTableData(jsonData));
        mergedData.push(jsonData);
      }
      callback(err, mergedData, tableData, mapData);
    });
  },
  function (mergedData, tableData, mapData, callback) {
    // Write the merged file
    fs.writeFile(`${targetDir}/${mergedFile}`, JSON.stringify(mergedData), function (err) {
      callback(err);
    });
    // Write the table file
    fs.writeFile(`${targetDir}/${tableFile}`, JSON.stringify(tableData), function (err) {
      callback(err);
    });
    // Write the map file
    fs.writeFile(`${targetDir}/${mapFile}`, JSON.stringify(mapData), function (err) {
      callback(err);
    });
  }
], function (err) {
  if (err) console.error(err.message);
  console.log('Success, all data processed and ready to serve beautiful things.');
});
