# OCP Data

[![Deploy](https://github.com/open-contracting-partnership/ocp-data/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/open-contracting-partnership/ocp-data/actions/workflows/deploy.yml)

## Maintenance

Admins can run the `python manage.py update-ocds-publishers [filename.csv]` command using as input the latest [MEL1 sheet](https://docs.google.com/spreadsheets/d/1NuGNEHpNFxrK-Vf0zGTWVEjrgqt2nYmKDbGN9FLp-k4/edit?gid=1539522696#gid=1539522696) to
update the OCDS publishers list for all countries.

## Serving the data

The final JSON data is served statically from the `publish` branch. When accepting an edit and merging a pull request to `master`, the `deploy.yml` workflow runs a script that processes the data and optimizes it for use in other applications. This includes the map on the [Open Contracting website](http://open-contracting.org).

## TopoJSON

`assets/ne_50m_admin_0_countries_topo.json` is generated from [Natural Earth](https://www.naturalearthdata.com/) GeoJSON. Download the 1:50m "Admin 0 – Countries" file from [nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), then convert it:

```bash
npx geo2topo ne_50m_admin_0_countries.geojson > assets/ne_50m_admin_0_countries_topo.json
```
