## Topojson

Topojson generated from the geojson using [topojson](https://www.npmjs.com/package/topojson).

```
$ topojson lib/ne_50m_admin_0_countries.json -o lib/ne_50m_admin_0_countries_topo.json -p --stitch-poles false
```

The --stitch-poles is important to prevent glitches caused by lines crossing the anti-meridian. 