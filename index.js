'use strict';

var async = require('async');
var fs = require('fs-extra');

// Merge all individual countries from the OC Status survey in one file
var sourceDir = './data/oc-status';
var targetDir = './dist/oc-status';
var mergedFile = 'all.json';
var mergedData = [];

async.waterfall([
  function (callback) {
    // Load all the country files and merge them in one array
    fs.readdir(sourceDir, function (err, list) {
      for (var f in list) {
        var path = `${sourceDir}/${list[f]}`;
        var contents = fs.readFileSync(path);
        var jsonData = JSON.parse(contents);
        mergedData.push(jsonData);
      }
      callback(err, mergedData);
    });
  },
  function (data, callback) {
    // Write the original data files
    fs.copy(sourceDir, targetDir, function (err) {
      callback(err, data);
    });
  },
  function (data, callback) {
    // Write the merged file
    fs.writeFile(`${targetDir}/${mergedFile}`, JSON.stringify(data), function (err) {
      callback(err);
    });
  }
], function (err) {
  if (err) console.error(err.message);
});
