import * as THREE from "three";

const TAU = Math.PI * 2;
const vertex = `varying vec3 vPosition; varying vec3 vNormal; varying vec3 vView;
varying vec2 vUv; varying vec3 vEast; varying vec3 vNorth;
void main(){
 vPosition=position; vNormal=normalize(normalMatrix*normal);
 // SphereGeometry's longitude starts at -90 in our convention. Let RepeatWrapping
 // handle the extra quarter turn without a discontinuity inside a triangle.
 vUv=uv+vec2(.25,0.);
 vec3 east=normalize(vec3(position.z,0.,-position.x)+vec3(.000001,0.,0.));
 vEast=normalMatrix*east; vNorth=normalMatrix*cross(normal,east);
 vec4 mv=modelViewMatrix*vec4(position,1.); vView=-mv.xyz; gl_Position=projectionMatrix*mv;
}`;
const fragment = `precision highp float;
uniform sampler2D surfaceMap;
uniform float pulse; uniform vec3 signalPoint;
varying vec3 vPosition; varying vec3 vNormal; varying vec3 vView;
varying vec2 vUv; varying vec3 vEast; varying vec3 vNorth;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
 vec3 p=normalize(vPosition), smoothNormal=normalize(vNormal), eye=normalize(vView);
 vec2 uv=vUv;
 vec4 surface=texture2D(surfaceMap,uv);
 float continent=surface.a;
 // Analytic east/north basis matches our atan(x,z) longitude convention, including
 // its handedness. Fade the tangent perturbation at the singular poles.
 vec2 tangentNormal=surface.rg*2.-1.;
 vec3 mapped=vec3(tangentNormal,sqrt(max(1.-dot(tangentNormal,tangentNormal),.01)));
 float polar=smoothstep(.015,.09,length(p.xz));
 mapped.xy*=5.5*continent*polar;
 vec3 n=normalize(vEast*mapped.x+vNorth*mapped.y+smoothNormal*max(mapped.z,.3));
 float facing=max(dot(smoothNormal,eye),0.); float rim=pow(1.-facing,14.);
 vec3 whiteLight=normalize(vec3(-1.1,1.3,.7)); vec3 redLight=normalize(vec3(1.3,.9,.1));
 vec3 lowerLight=normalize(vec3(-1.1,-1.0,.1));
 float diffuse=max(dot(n,whiteLight),0.); float red=max(dot(n,redLight),0.);
 float lower=max(dot(n,lowerLight),0.);
 float spec=pow(max(dot(n,normalize(whiteLight+eye)),0.),65.);
 float redSpec=pow(max(dot(n,normalize(redLight+eye)),0.),48.);
 float reliefEdge=length(mapped.xy);
 vec3 base=mix(vec3(.001,.002,.003),vec3(.006,.011,.015),continent);
 vec3 color=base*(.35+diffuse*1.4);
 color+=vec3(.38,.57,.66)*(spec*.36+reliefEdge*diffuse*.32)*continent;
 color+=vec3(.55,.75,.85)*rim*(.18+diffuse*.8);
 color+=vec3(.95,.018,.035)*(rim*(red*1.3+lower*1.15)+redSpec*continent*.22+reliefEdge*lower*continent*.07);
 // Geographic light clusters replace the uniform point-cloud continents.
 float cities=surface.b*surface.b;
 cities=pow(smoothstep(.002,.6,cities),.72)*continent;
 color+=vec3(.66,.83,1.)*cities*1.65;
 // Fine, anti-aliased survey lines stay on the surface and disappear at the poles.
 vec2 gridUv=uv*vec2(36.,18.);
 vec2 gridDistance=abs(fract(gridUv-.5)-.5)/max(fwidth(gridUv),vec2(.0001));
 float grid=1.-smoothstep(.25,.85,min(gridDistance.x,gridDistance.y));
 color+=vec3(.006,.012,.016)*grid*polar*(.25+facing*.3);
 float grain=hash(floor(p*440.));
 color+=vec3(.12,.20,.25)*smoothstep(.965,1.,grain)*continent*(.2+diffuse*.6);
 if(pulse>0.){
   float angular=acos(clamp(dot(p,signalPoint),-1.,1.));
   float wave=exp(-pow((angular-pulse*2.8)*20.,2.))*sin(pulse*3.1415926);
   color+=vec3(.9,.065,.10)*wave*.85;
 }
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function pointOnEarth(lon: number, lat: number, radius = 1) {
  const phi = lat * Math.PI / 180, theta = lon * Math.PI / 180;
  return new THREE.Vector3(Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)).multiplyScalar(radius);
}

export async function createGlobe(canvas: HTMLCanvasElement, signal: AbortSignal) {
  // Settle every decode before allocating GPU resources; close successful decodes
  // even if another request fails or the lazy initialization is aborted.
  const loaded = await Promise.allSettled(["land-mask.png", "earth-normal.png", "earth-night.jpg"].map(async file => {
    const response = await fetch(`/pages/not-found/${file}`, { signal });
    if (!response.ok) throw new Error("Globe texture unavailable");
    return createImageBitmap(await response.blob());
  }));
  const maps: HTMLCanvasElement[] = [];
  try {
    signal.throwIfAborted();
    for (const result of loaded) {
      if (result.status === "rejected") throw result.reason;
      const map = document.createElement("canvas");
      map.width = result.value.width; map.height = result.value.height;
      maps.push(map);
      const context = map.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Texture canvas unavailable");
      context.drawImage(result.value, 0, 0);
    }
  } catch (error) {
    maps.forEach(map => { map.width = map.height = 1; });
    throw error;
  } finally {
    loaded.forEach(result => { if (result.status === "fulfilled") result.value.close(); });
  }
  const [mapCanvas, normalCanvas, nightCanvas] = maps;
  const pixels = mapCanvas.getContext("2d")!.getImageData(0, 0, mapCanvas.width, mapCanvas.height).data;
  const nightPixels = nightCanvas.getContext("2d")!.getImageData(0, 0, nightCanvas.width, nightCanvas.height).data;
  const sampleAt = (map: HTMLCanvasElement, data: Uint8ClampedArray, lon: number, lat: number) => {
    const x = Math.min(map.width - 1, Math.floor((lon + 180) / 360 * map.width));
    const y = Math.min(map.height - 1, Math.floor((90 - lat) / 180 * map.height));
    return data[(y * map.width + x) * 4];
  };
  const scene = new THREE.Scene();
  const textures: THREE.Texture[] = [];
  let renderer: THREE.WebGLRenderer | undefined;
  let disposed = false;
  const dispose = () => {
    if (disposed) return; disposed = true;
    scene.traverse(object => {
      const item = object as THREE.Mesh;
      item.geometry?.dispose();
      if (Array.isArray(item.material)) item.material.forEach(material => material.dispose()); else item.material?.dispose();
    });
    textures.forEach(texture => texture.dispose());
    renderer?.dispose(); renderer?.forceContextLoss();
    maps.forEach(map => { map.width = map.height = 1; });
  };
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true });
    const gpu = renderer;
    // A failed shader must never replace the poster with a blank, 'ready' canvas.
    gpu.debug.onShaderError = () => { throw new Error("Globe shader unavailable"); };
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
    camera.position.set(0, 0, 4.9);
    const world = new THREE.Group(); scene.add(world);
    const earth = new THREE.Group(); world.add(earth);
    earth.rotation.y = 1.22;
    earth.rotation.z = -.12;
    // One RGBA upload instead of three sampled maps: tangent normal XY, square-
    // root linear night luminance, and land coverage. DataTexture avoids canvas
    // alpha premultiplication destroying normals over dark ocean pixels.
    const surfaceData = normalCanvas.getContext("2d")!.getImageData(0, 0, normalCanvas.width, normalCanvas.height).data;
    if (normalCanvas.width !== nightCanvas.width || normalCanvas.height !== nightCanvas.height) throw new Error("Globe map dimensions differ");
    const linear = Array.from({ length: 256 }, (_, i) => {
      const value = i / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    for (let y = 0; y < normalCanvas.height; y++) {
      const maskRow = Math.min(mapCanvas.height - 1, Math.floor((y + .5) / normalCanvas.height * mapCanvas.height)) * mapCanvas.width;
      for (let x = 0; x < normalCanvas.width; x++) {
        const i = (y * normalCanvas.width + x) * 4;
        const maskX = Math.min(mapCanvas.width - 1, Math.floor((x + .5) / normalCanvas.width * mapCanvas.width));
        const luminance = linear[nightPixels[i]] * .2126 + linear[nightPixels[i + 1]] * .7152 + linear[nightPixels[i + 2]] * .0722;
        surfaceData[i + 2] = Math.round(Math.sqrt(luminance) * 255);
        surfaceData[i + 3] = pixels[(maskRow + maskX) * 4];
      }
    }
    const surfaceTexture = new THREE.DataTexture(new Uint8Array(surfaceData.buffer), normalCanvas.width, normalCanvas.height);
    surfaceTexture.flipY = true;
    surfaceTexture.wrapS = THREE.RepeatWrapping;
    surfaceTexture.minFilter = THREE.LinearMipmapLinearFilter;
    surfaceTexture.magFilter = THREE.LinearFilter;
    surfaceTexture.generateMipmaps = true;
    surfaceTexture.needsUpdate = true;
    textures.push(surfaceTexture);
    const shellMaterial = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { surfaceMap: { value: surfaceTexture }, pulse: { value: 0 }, signalPoint: { value: new THREE.Vector3(0, 0, 1) } } });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 96), shellMaterial);
    earth.add(shell);

    const points: number[] = [], colors: number[] = [];
    // Sparse crimson transmitters follow populated land, never the far-side sky.
    for (let i = 0; i < 12000; i++) {
      const y = 1 - 2 * (i + .5) / 12000;
      const lat = Math.asin(y) * 180 / Math.PI;
      const lon = ((i * 137.507764) % 360) - 180;
      if (sampleAt(mapCanvas, pixels, lon, lat) < 100 || sampleAt(nightCanvas, nightPixels, lon, lat) < 95 || i % 3) continue;
      points.push(...pointOnEarth(lon, lat, 1.002).toArray());
      colors.push(1., .035, .06);
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    pointGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    earth.add(new THREE.Points(pointGeometry, new THREE.PointsMaterial({ size: .012, vertexColors: true, depthWrite: false })));

    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.012, 80, 48), new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: `varying vec3 vNormal; varying vec3 vView;
      void main(){
        vec3 n=normalize(vNormal);
        float rim=pow(1.-abs(dot(n,normalize(vView))),5.);
        float red=pow(max(dot(n,normalize(vec3(.8,.65,.05))),0.),5.)+pow(max(dot(n,normalize(vec3(-.8,-.7,.05))),0.),5.);
        vec3 c=mix(vec3(.38,.65,.8),vec3(1.,.025,.05),clamp(red*1.6,0.,1.));
        gl_FragColor=vec4(c,rim*(.2+red*.35));
      }`,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    world.add(atmosphere);

    const glowCanvas = document.createElement("canvas"); glowCanvas.width = glowCanvas.height = 64;
    maps.push(glowCanvas);
    const glowContext = glowCanvas.getContext("2d");
    if (!glowContext) throw new Error("Glow canvas unavailable");
    const glow = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "#ffffff"); glow.addColorStop(.07, "#ffffff"); glow.addColorStop(.17, "#ffffffc0"); glow.addColorStop(.4, "#ffffff25"); glow.addColorStop(1, "#ffffff00");
    glowContext.fillStyle = glow; glowContext.fillRect(0, 0, 64, 64);
    const glowTexture = new THREE.CanvasTexture(glowCanvas); textures.push(glowTexture);
    const makeGlow = (color: number, scale: number) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      sprite.scale.setScalar(scale); return sprite;
    };
    const hotspot = makeGlow(0xff2944, .13);
    hotspot.position.copy(pointOnEarth(-72, 19, 1.025)); earth.add(hotspot);
    const signalGlow = makeGlow(0xff3b51, .24); signalGlow.visible = false; earth.add(signalGlow);

    // Fixed illumination flares are just two local sprites, outside the silhouette.
    for (const [x, y] of [[.73, .70], [-.73, -.70]]) {
      const flare = makeGlow(0xff4355, .30);
      flare.position.set(x, y, .14); world.add(flare);
      const streak = makeGlow(0xffb9be, .1);
      streak.scale.set(.32, .018, 1); streak.material.rotation = -.55;
      streak.position.copy(flare.position); world.add(streak);
    }

    const orbits = [
      { radius: 1.58, tilt: 1.05, spin: .48, color: 0xd1eaf4, speed: .075, phase: .5 },
      { radius: 1.48, tilt: 1.24, spin: .62, color: 0xff3648, speed: -.053, phase: 3.5 },
      { radius: 1.72, tilt: 1.35, spin: -.38, color: 0x8cc8df, speed: .04, phase: 1.8 },
    ].map((spec, index) => {
      const group = new THREE.Group(); group.rotation.set(spec.tilt, .1, spec.spin, "ZXY"); world.add(group);
      const curve = Array.from({ length: 241 }, (_, i) => new THREE.Vector3(Math.cos(i / 240 * TAU) * spec.radius, Math.sin(i / 240 * TAU) * spec.radius, 0));
      const geometry = new THREE.BufferGeometry().setFromPoints(curve);
      const material = new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: index === 0 ? .8 : .5 });
      group.add(new THREE.Line(geometry, material));
      // Glow stays local to the moving signal; no extra path mesh or bloom pass.
      const node = makeGlow(spec.color, index === 0 ? .19 : .15); group.add(node);
      const core = new THREE.Mesh(new THREE.SphereGeometry(index === 0 ? .018 : .010, 12, 8), new THREE.MeshBasicMaterial({ color: spec.color })); group.add(core);
      return { ...spec, group, material, node, core };
    });

    // Sparse survey ring and crosshair sit behind the sphere, like the reference.
    const ringPositions: number[] = [];
    for (let i = 0; i < 190; i++) {
      const a = i / 190 * TAU;
      ringPositions.push(Math.cos(a) * 1.38, Math.sin(a) * 1.38, -.55);
    }
    const ringGeometry = new THREE.BufferGeometry(); ringGeometry.setAttribute("position", new THREE.Float32BufferAttribute(ringPositions, 3));
    world.add(new THREE.Points(ringGeometry, new THREE.PointsMaterial({ color: 0xad8582, size: .007, transparent: true, opacity: .5 })));
    const crossGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.8, 0, -.7), new THREE.Vector3(1.8, 0, -.7), new THREE.Vector3(0, -1.7, -.7), new THREE.Vector3(0, 1.7, -.7)]);
    world.add(new THREE.LineSegments(crossGeometry, new THREE.LineBasicMaterial({ color: 0xa8c4cd, transparent: true, opacity: .18 })));

    const starPositions: number[] = [];
    for (let i = 0; i < 100; i++) starPositions.push(Math.sin(i * 713.7) * 3.8, Math.sin(i * 193.3) * 2.8, -1.2 - (i % 4) * .3);
    const starGeometry = new THREE.BufferGeometry(); starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xc5dce8, size: .006, transparent: true, opacity: .5 })); scene.add(stars);

    const raycaster = new THREE.Raycaster();
    const initialOrientation = earth.quaternion.clone();
    const rotation = new THREE.Quaternion();
    const trackball = (x: number, y: number) => {
      // Sphere with a hyperbolic skirt keeps movement continuous beyond its edge.
      const distance = x * x + y * y;
      return new THREE.Vector3(x, y, distance <= .5 ? Math.sqrt(1 - distance) : .5 / Math.sqrt(distance)).normalize();
    };
    let bufferWidth = 0, bufferHeight = 0, pixelRatio = 0;
    return {
      resize(width: number, height: number, ratio: number) {
        if (width === bufferWidth && height === bufferHeight && ratio === pixelRatio) return;
        bufferWidth = width; bufferHeight = height;
        if (ratio !== pixelRatio) { gpu.setPixelRatio(ratio); pixelRatio = ratio; }
        gpu.setSize(width, height, false);
        camera.aspect = width / height;
        camera.fov = camera.aspect < 1.24 ? Math.atan(Math.tan(18 * Math.PI / 180) * 1.24 / camera.aspect) * 360 / Math.PI : 36;
        camera.updateProjectionMatrix();
      },
      drag(fromX: number, fromY: number, toX: number, toY: number) {
        rotation.setFromUnitVectors(trackball(fromX, fromY), trackball(toX, toY));
        earth.quaternion.premultiply(rotation).normalize();
      },
      spin(delta: number) {
        rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta * TAU / 180);
        earth.quaternion.premultiply(rotation).normalize();
      },
      rotate(direction: string) {
        if (direction === "reset") earth.quaternion.copy(initialOrientation);
        else {
          const horizontal = direction === "left" || direction === "right";
          rotation.setFromAxisAngle(new THREE.Vector3(horizontal ? 0 : 1, horizontal ? 1 : 0, 0),
            (direction === "left" || direction === "down" ? -1 : 1) * Math.PI / 12);
          earth.quaternion.premultiply(rotation).normalize();
        }
      },
      orientation() { return earth.quaternion.toArray(); },
      signal(x: number, y: number) {
        scene.updateMatrixWorld(true);
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const hit = raycaster.intersectObject(shell)[0];
        const local = hit ? earth.worldToLocal(hit.point.clone()).normalize() : earth.worldToLocal(new THREE.Vector3(0, 0, 1)).normalize();
        shellMaterial.uniforms.signalPoint.value.copy(local);
        signalGlow.position.copy(local).multiplyScalar(1.03);
      },
      render(time: number, x: number, y: number, pulseAge: number) {
        if (disposed) return;
        stars.position.set(x * -.015, y * .015, 0);
        const pulse = pulseAge >= 0 && pulseAge < 2 ? pulseAge / 2 : 0;
        shellMaterial.uniforms.pulse.value = pulse;
        signalGlow.visible = pulseAge >= 0 && pulseAge < 2;
        (signalGlow.material as THREE.SpriteMaterial).opacity = Math.sin(pulse * Math.PI);
        for (const [index, orbit] of orbits.entries()) {
          const angle = time * orbit.speed + orbit.phase + (pulse > 0 ? pulse * TAU : 0);
          orbit.node.position.set(Math.cos(angle) * orbit.radius, Math.sin(angle) * orbit.radius, 0);
          orbit.core.position.copy(orbit.node.position);
          orbit.node.scale.setScalar((index === 0 ? .19 : .15) + Math.sin(pulse * Math.PI) * .12);
          orbit.material.opacity = (index === 0 ? .8 : .5) + Math.sin(pulse * Math.PI) * .3;
        }
        gpu.render(scene, camera);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export type GlobeRenderer = Awaited<ReturnType<typeof createGlobe>>;
