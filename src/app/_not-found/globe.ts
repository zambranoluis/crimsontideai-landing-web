import * as THREE from "three";

const TAU = Math.PI * 2;
const vertex = `varying vec3 vPosition; varying vec3 vNormal; varying vec3 vView;
void main(){ vPosition=position; vNormal=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vView=-mv.xyz; gl_Position=projectionMatrix*mv; }`;
const fragment = `precision highp float;
uniform sampler2D land; uniform float pulse; uniform vec3 signalPoint;
varying vec3 vPosition; varying vec3 vNormal; varying vec3 vView;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
 vec3 p=normalize(vPosition), n=normalize(vNormal), eye=normalize(vView);
 vec2 uv=vec2(atan(p.x,p.z)/6.2831853+.5,asin(p.y)/3.1415926+.5);
 float continent=texture2D(land,uv).r;
 vec3 cell=floor(p*70.); float grain=hash(cell);
 float facing=max(dot(n,eye),0.); float rim=pow(1.-facing,3.2);
 vec3 whiteLight=normalize(vec3(-1.4,1.0,1.)); vec3 redLight=normalize(vec3(1.3,.65,.15));
 float diffuse=max(dot(n,whiteLight),0.); float red=max(dot(n,redLight),0.);
 float spec=pow(max(dot(reflect(-whiteLight,n),eye),0.),85.)*.22;
 float redSpec=pow(max(dot(reflect(-redLight,n),eye),0.),34.);
 float plate=.75+grain*.35;
 vec3 base=mix(vec3(.003,.006,.010),vec3(.013,.025,.035),continent);
 vec3 color=base*(.20+diffuse*1.1)*plate;
 color+=vec3(.37,.57,.66)*spec*(.15+continent*.6);
 color+=vec3(.46,.69,.81)*rim*(.12+diffuse*.9);
 color+=vec3(.75,.019,.044)*(redSpec*.1+rim*red*.65);
 // Fine seams and broken glints give the shell a machined, faceted surface.
 vec3 seam=abs(fract(p*70.)-.5); float edge=smoothstep(.465,.495,max(seam.x,max(seam.y,seam.z)));
 color+=vec3(.07,.13,.16)*edge*continent*diffuse*(.15+grain*.25);
 float angular=acos(clamp(dot(p,signalPoint),-1.,1.));
 float wave=exp(-pow((angular-pulse*2.8)*20.,2.))*sin(pulse*3.1415926);
 color+=vec3(.9,.065,.10)*wave*.85;
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function pointOnEarth(lon: number, lat: number, radius = 1) {
  const phi = lat * Math.PI / 180, theta = lon * Math.PI / 180;
  return new THREE.Vector3(Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)).multiplyScalar(radius);
}

export async function createGlobe(canvas: HTMLCanvasElement, signal: AbortSignal) {
  // Load before constructing GPU resources so a cancelled fetch cannot leak a context.
  const response = await fetch("/pages/not-found/land-mask.png", { signal });
  if (!response.ok) throw new Error("Globe texture unavailable");
  const bitmap = await createImageBitmap(await response.blob());
  if (signal.aborted) { bitmap.close(); throw new DOMException("Aborted", "AbortError"); }
  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = bitmap.width; mapCanvas.height = bitmap.height;
  const mapContext = mapCanvas.getContext("2d", { willReadFrequently: true });
  if (!mapContext) { bitmap.close(); throw new Error("Texture canvas unavailable"); }
  mapContext.drawImage(bitmap, 0, 0); bitmap.close();
  const pixels = mapContext.getImageData(0, 0, mapCanvas.width, mapCanvas.height).data;
  const landAt = (lon: number, lat: number) => {
    const x = Math.min(mapCanvas.width - 1, Math.floor((lon + 180) / 360 * mapCanvas.width));
    const y = Math.min(mapCanvas.height - 1, Math.floor((90 - lat) / 180 * mapCanvas.height));
    return pixels[(y * mapCanvas.width + x) * 4] > 100;
  };
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
  camera.position.set(0, 0, 4.9);
  const world = new THREE.Group(); scene.add(world);
  const earth = new THREE.Group(); world.add(earth);
  earth.rotation.y = 1.22;
  earth.rotation.z = -.12;
  const texture = new THREE.CanvasTexture(mapCanvas);
  const shellMaterial = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { land: { value: texture }, pulse: { value: 0 }, signalPoint: { value: new THREE.Vector3(0, 0, 1) } } });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 96), shellMaterial);
  earth.add(shell);

  const points: number[] = [], colors: number[] = [];
  // Equal-area sampling avoids the dense polar rings of latitude/longitude grids.
  for (let i = 0; i < 26000; i++) {
    const sample = (i * 7919) % 26000;
    const y = 1 - 2 * (sample + .5) / 26000;
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = ((sample * 137.507764) % 360) - 180;
    if (!landAt(lon, lat)) continue;
    const point = pointOnEarth(lon, lat, 1.007 + (i % 5) * .0008);
    points.push(...point.toArray());
    const bright = .36 + (Math.sin(i * 73.1) + 1) * .25;
    const red = i % 39 === 0;
    colors.push(red ? .95 : bright * .65, red ? .045 : bright * .85, red ? .08 : bright);
  }
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  pointGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const pointMaterial = new THREE.PointsMaterial({ size: .01, vertexColors: true, transparent: true, opacity: .8, depthWrite: false });
  pointGeometry.setDrawRange(0, Math.floor(points.length / 6));
  earth.add(new THREE.Points(pointGeometry, pointMaterial));

  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.045, 80, 48), new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main(){float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.5); vec3 c=mix(vec3(.25,.60,.77),vec3(.95,.02,.06),smoothstep(-.15,.65,vNormal.x)); gl_FragColor=vec4(c,rim*.16);}`,
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  world.add(atmosphere);

  const glowCanvas = document.createElement("canvas"); glowCanvas.width = glowCanvas.height = 64;
  const glowContext = glowCanvas.getContext("2d")!;
  const glow = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "#ffffff"); glow.addColorStop(.07, "#ffffff"); glow.addColorStop(.17, "#ffffffc0"); glow.addColorStop(.4, "#ffffff25"); glow.addColorStop(1, "#ffffff00");
  glowContext.fillStyle = glow; glowContext.fillRect(0, 0, 64, 64);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const makeGlow = (color: number, scale: number) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sprite.scale.setScalar(scale); return sprite;
  };
  const hotspot = makeGlow(0xff2944, .34);
  hotspot.position.copy(pointOnEarth(-72, 19, 1.025)); earth.add(hotspot);
  const signalGlow = makeGlow(0xff3b51, .38); signalGlow.visible = false; earth.add(signalGlow);

  const orbits = [
    { radius: 1.58, tilt: 1.05, spin: .48, color: 0xd1eaf4, speed: .075, phase: .5 },
    { radius: 1.48, tilt: 1.24, spin: .62, color: 0xff3648, speed: -.053, phase: 3.5 },
    { radius: 1.72, tilt: 1.35, spin: -.38, color: 0x8cc8df, speed: .04, phase: 1.8 },
  ].map((spec, index) => {
    const group = new THREE.Group(); group.rotation.set(spec.tilt, .1, spec.spin, "ZXY"); world.add(group);
    const curve = Array.from({ length: 241 }, (_, i) => new THREE.Vector3(Math.cos(i / 240 * TAU) * spec.radius, Math.sin(i / 240 * TAU) * spec.radius, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(curve);
    const material = new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: index === 0 ? .6 : .29 });
    group.add(new THREE.Line(geometry, material));
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
  let disposed = false;
  let bufferWidth = 0, bufferHeight = 0, pixelRatio = 0;
  return {
    resize(width: number, height: number, ratio: number) {
      if (width === bufferWidth && height === bufferHeight && ratio === pixelRatio) return;
      bufferWidth = width; bufferHeight = height;
      if (ratio !== pixelRatio) { renderer.setPixelRatio(ratio); pixelRatio = ratio; }
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = camera.aspect < 1.12 ? Math.atan(Math.tan(18 * Math.PI / 180) * 1.12 / camera.aspect) * 360 / Math.PI : 36;
      camera.updateProjectionMatrix();
    },
    drag(fromX: number, fromY: number, toX: number, toY: number) {
      rotation.setFromUnitVectors(trackball(fromX, fromY), trackball(toX, toY));
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
        orbit.material.opacity = (index === 0 ? .6 : .29) + Math.sin(pulse * Math.PI) * .3;
      }
      renderer.render(scene, camera);
    },
    dispose() {
      if (disposed) return; disposed = true;
      scene.traverse(object => {
        const item = object as THREE.Mesh;
        item.geometry?.dispose();
        if (Array.isArray(item.material)) item.material.forEach(material => material.dispose()); else item.material?.dispose();
      });
      texture.dispose(); glowTexture.dispose(); renderer.dispose();
      renderer.forceContextLoss();
      mapCanvas.width = mapCanvas.height = 1;
    },
  };
}

export type GlobeRenderer = Awaited<ReturnType<typeof createGlobe>>;
