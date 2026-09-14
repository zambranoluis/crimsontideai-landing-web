# 404 artwork

- `land-mask.png`: generated from Natural Earth 1:50m physical land polygons, public domain, https://www.naturalearthdata.com/about/terms-of-use/. Source geometry: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson. Rebuild with `scripts/generate-not-found-land.mjs` and a local copy of that GeoJSON.
- `globe-poster.png`: transparent capture of the site's own procedural Three.js 404 globe at its initial pose. Contains the above Natural Earth continent detail. Generated from the renderer, not from the supplied reference image.
- `terrain-poster.png`: transparent capture of the site's own procedural 404 terrain at its initial pose.
- The user-supplied 404 reference informs composition, light, and materials. No text or interface is baked into these assets.
