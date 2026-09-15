# 404 artwork

- `land-mask.png`: generated from Natural Earth 1:50m physical land polygons, public domain, https://www.naturalearthdata.com/about/terms-of-use/. Source geometry: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson. Rebuild with `scripts/generate-not-found-land.mjs` and a local copy of that GeoJSON.
- `earth-relief.png` and `earth-lights.png`: original deterministic 2048 x 1024 procedural maps. `scripts/generate-not-found-earth-surface.mjs` derives relief from seamless spherical noise and lights from irregular land-masked clusters using the land mask above. The fixed seed and output hashes are recorded in `earth-surface-manifest.json`.
- `globe-poster.png`: transparent capture of the site's own procedural Three.js 404 globe at its initial pose. It contains the Natural Earth land outline and the generated surface maps, but no pixels from `public/not_found_page/planet.png`.
- `terrain-poster.png`: transparent capture of the site's own procedural 404 terrain at its initial pose.
- The user-supplied 404 reference informs composition, illumination, and material direction only. No text or interface is baked into these assets.
