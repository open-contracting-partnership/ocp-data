# OCP Data

[![Deploy](https://github.com/open-contracting-partnership/ocp-data/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/open-contracting-partnership/ocp-data/actions/workflows/deploy.yml)

## Maintenance

Admins can run the `python manage.py update-ocds-publishers [filename.csv]` command using as input the latest [MEL1 sheet](https://docs.google.com/spreadsheets/d/1NuGNEHpNFxrK-Vf0zGTWVEjrgqt2nYmKDbGN9FLp-k4/edit?gid=1539522696#gid=1539522696) to
update the OCDS publishers list for all countries.

## Serving the data

The final JSON data is served statically from the `publish` branch. When accepting an edit and merging a pull request to `master`, the `deploy.yml` workflow runs a script that processes the data and optimizes it for use in other applications. This includes the map on the [Open Contracting website](http://open-contracting.org).

## TopoJSON

TopoJSON is generated from GeoJSON:

```bash
npx geo2topo lib/ne_50m_admin_0_countries.json > lib/ne_50m_admin_0_countries_topo.json
```
