'use strict';

var async = require('async');
var fs = require('fs-extra');

// Merge all individual countries from the OC Status survey in one file
var sourceDir = './data/oc-status';
var targetDir = './dist/oc-status';
var mergedFile = 'all.json';
var tableFile = 'table.json';
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
    ocds_implementation: countryData.results.ocds_implementation ? 'Yes' : 'No',
    ogp_commitment: countryData.results.ogp_commitments[0].ogp_commitment !== '' || null ? 'Yes' : 'No'
  };
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

        tableData.data.push(prepTableData(jsonData));
        mergedData.push(jsonData);
      }
      callback(err, mergedData, tableData);
    });
  },
  function (mergedData, tableData, callback) {
    // Write the merged file
    fs.writeFile(`${targetDir}/${mergedFile}`, JSON.stringify(mergedData), function (err) {
      callback(err);
    });
    // Write the merged file
    fs.writeFile(`${targetDir}/${tableFile}`, JSON.stringify(tableData), function (err) {
      callback(err);
    });
  }
], function (err) {
  if (err) console.error(err.message);
  console.log('Success, all data processed and ready to serve beautiful things.');
});
