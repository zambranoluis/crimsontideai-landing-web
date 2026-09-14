# 404 artwork

- `land-mask.png`: generated from Natural Earth 1:50m physical land polygons, public domain, https://www.naturalearthdata.com/about/terms-of-use/. Source geometry: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson. Rebuild with `scripts/generate-not-found-land.mjs` and a local copy of that GeoJSON.
- `globe-poster.png`: transparent capture of the site's own procedural Three.js 404 globe at its initial pose. Contains the above Natural Earth continent detail. Generated from the renderer, not from the supplied reference image.
- `terrain-poster.png`: transparent capture of the site's own procedural 404 terrain at its initial pose.
- The user-supplied 404 reference informs composition, light, and materials. No text or interface is baked into these assets.

## Detailed globe surface (2026-09-14)

- `earth-normal.png`: Solar System Scope / INOVE, Earth Normal Map, https://www.solarsystemscope.com/textures/download/2k_earth_normal_map.tif (2048 × 1024). Converted losslessly from TIFF to RGB PNG with Sharp; no resampling or pixel edits.
- `earth-night.jpg`: Solar System Scope / INOVE, Earth Night Map, https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg (2048 × 1024). Original JPEG, unchanged.
- Both maps are distributed by https://www.solarsystemscope.com/textures/ under Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/. Retrieved 2026-09-14. The provider describes the Earth pack as based on NASA imagery and geographic data.
- Shader adaptations: normal-map relief amplification; desaturated, cool-white emissive city lights; dark metallic land/ocean palette; crimson lighting, geographic grid and procedural signals. Longitude -180 to +180 maps left to right and latitude +90 to -90 maps top to bottom, matching the Natural Earth mask. No geographic offset is applied. Source files remain intact. During initialization the renderer packs normal XY, square-root linear night luminance, and land coverage into one RGBA data texture; normal Z is reconstructed in the shader. This reduces texture sampling cost without adding geometry.
- `globe-poster.png`: regenerated transparent renderer capture at the unchanged initial Americas-facing pose; includes the adapted Solar System Scope maps and Natural Earth mask. The same CC BY 4.0 attribution applies to these incorporated maps.
- Accessible, browser-readable attribution is published in `credits.html`, linked as “Globe credits” in the server-rendered 404 footer, including reduced-motion and no-JavaScript views.
