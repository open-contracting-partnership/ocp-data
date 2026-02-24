/**
 * This script takes raw OCP data and processes it into something that can be
 * used more easily by other applications.
 */

import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import slugify from 'slugify';
import mapData from './lib/ne_50m_admin_0_countries_topo.json' with { type: 'json' };

const sourceDir = './data/oc-status';
const targetDir = './dist/oc-status';
const tableData = {
    meta: {
        display: [
            {
                key: 'country',
                value: 'Country',
            },
            {
                key: 'ocds_data',
                value: 'Publishing OCDS data',
            },
            {
                key: 'ocds_implementation',
                value: 'OCDS implementation',
            },
            {
                key: 'ogp_commitment',
                value: 'Relevant OGP commitment',
            },
        ],
    },
    data: [],
};

const output = {
    merged: {
        data: [],
        file: '_all.json',
    },
    index: {
        data: {},
        file: '_index.json',
    },
    map: {
        data: mapData,
        file: '_map.json',
    },
    table: {
        data: tableData,
        file: '_table.json',
    },
};

function processOCDS(countryData) {
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

function prepTableData(countryData) {
    const d = {
        country: countryData.name,
        ocds_data: processOCDS(countryData),
        ocds_implementation: countryData.results.ocds_implementation ? 'Yes' : 'No',
    };
    if (countryData.results.ogp_commitments[0]) {
        d.ogp_commitment = countryData.results.ogp_commitments[0].ogp_commitment !== '' || null ? 'Yes' : 'No';
    }
    return d;
}

try {
    // Write the original data files
    await fs.cp(sourceDir, targetDir, { recursive: true });

    // remove unused geojson properties
    output.map.data.objects.ne_50m_admin_0_countries.geometries =
        output.map.data.objects.ne_50m_admin_0_countries.geometries.map((geo) => {
            geo.properties = {
                iso_a2: geo.properties.iso_a2,
                name: geo.properties.name,
            };
            return geo;
        });

    // process country data files
    const list = await fs.readdir(sourceDir);
    for (const filename of list.filter((f) => f !== '_index.json')) {
        const jsonData = JSON.parse(readFileSync(`${sourceDir}/${filename}`));

        // Add an indication if the country has any data reported
        jsonData.results.has_data = !Object.values(jsonData.results).every((v) => !v.length);

        const geoIndex = output.map.data.objects.ne_50m_admin_0_countries.geometries.findIndex(
            (o) => o.properties.iso_a2.toLowerCase() === jsonData.iso,
        );

        if (geoIndex !== -1) {
            Object.assign(
                output.map.data.objects.ne_50m_admin_0_countries.geometries[geoIndex].properties,
                jsonData.results,
            );
        }

        output.index.data[filename] = { name: jsonData.name };
        output.table.data.data.push(prepTableData(jsonData));
        output.merged.data.push(jsonData);
    }

    // for "countries" with no valid ISO_A2 code, change for a slug of
    // the name, this prevents any duplicate entries
    output.map.data.objects.ne_50m_admin_0_countries.geometries =
        output.map.data.objects.ne_50m_admin_0_countries.geometries.map((geo) => {
            if (geo.properties.iso_a2 === -99) {
                geo.properties.iso_a2 = slugify(geo.properties.name);
            }
            return geo;
        });

    await Promise.all(
        Object.values(output).map((f) => fs.writeFile(`${targetDir}/${f.file}`, JSON.stringify(f.data))),
    );
} catch (err) {
    console.error(err.message);
}
