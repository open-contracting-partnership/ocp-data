## Topojson

Topojson generated from the geojson using [topojson](https://www.npmjs.com/package/topojson).

```
npx geo2topo lib/ne_50m_admin_0_countries.json > lib/ne_50m_admin_0_countries_topo.json
```

The --stitch-poles is important to prevent glitches caused by lines crossing the anti-meridian.
