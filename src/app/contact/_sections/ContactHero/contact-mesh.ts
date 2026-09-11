// Terrain and light choreography adapted from the supplied v9.1.27 Contact mock.
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  function terrain(nx: number, z: number, time: number){
    const broad = Math.sin(nx*3.8 + time*.88 + z*2.5)*.48;
    const cross = Math.cos(z*7.4 - time*.68 + nx*1.8)*.32;
    const detail = Math.sin((nx+z*.68)*12.6 + time*.44)*.14
      + Math.cos(nx*18.5-z*8.2-time*.30)*.09;
    const ridgeCenter = .12 + Math.sin(time*.31)*.14;
    const ridgeWidth = .16 + z*.08;
    const ridge = Math.exp(-Math.pow(nx-ridgeCenter,2)/ridgeWidth)
      * (.52 + Math.sin(z*5.4-time*.57)*.22);
    const secondRidge = Math.exp(-Math.pow(nx+.52-Math.cos(time*.24)*.08,2)/(.10+z*.07))
      * (.30 + Math.cos(z*7+time*.46)*.12);
    return broad+cross+detail+ridge+secondRidge;
  }

  export function projectContactPoint(column: number, row: number, time: number, width: number, height: number, columns: number, rows: number){
    const x01 = column/(columns-1);
    const z = row/(rows-1);
    const nx = (x01-.5)*2;
    const depth = Math.pow(z,1.32);
    const relief = terrain(nx,z,time);
    const centerX = width*(.65+Math.sin(time*.18)*.014);
    const spread = width*(.18+depth*.64);
    const xDrift = Math.sin(z*9.2+time*.54+nx*1.7)*5*depth;
    const x = centerX+nx*spread+xDrift;
    const baseY = height*(.20+depth*.78);
    const lift = relief*height*(.034+depth*.082);
    const tilt = nx*height*.035*depth;
    const y = baseY-lift+tilt;
    return {x,y,x01,z,relief,depth};
  }


export function drawContactMesh(context: CanvasRenderingContext2D, width: number, height: number, columns: number, rows: number, time: number) {
  function cyclicDistance(a: number, b: number){
    const distance = Math.abs(a-b);
    return Math.min(distance,1-distance);
  }

  function addPoint(path: Path2D, x: number, y: number, radius: number){
    path.moveTo(x+radius,y);
    path.arc(x,y,radius,0,Math.PI*2);
  }

  function paintAmbientLights(time: number){
    const redBreath = .84+.16*Math.sin(time*1.05);
    const redX = width*(.72+Math.sin(time*.22)*.045);
    const redY = height*(.40+Math.cos(time*.28)*.055);
    const redRadius = Math.min(width,height)*.48;
    const redGlow = context.createRadialGradient(redX,redY,0,redX,redY,redRadius);
    redGlow.addColorStop(0,`rgba(239,51,64,${.17*redBreath})`);
    redGlow.addColorStop(.42,`rgba(239,51,64,${.055*redBreath})`);
    redGlow.addColorStop(1,'rgba(239,51,64,0)');
    context.fillStyle = redGlow;
    context.fillRect(0,0,width,height);

    const blueX = width*(.78+Math.cos(time*.19)*.04);
    const blueY = height*(.73+Math.sin(time*.25)*.045);
    const blueRadius = Math.min(width,height)*.34;
    const blueGlow = context.createRadialGradient(blueX,blueY,0,blueX,blueY,blueRadius);
    blueGlow.addColorStop(0,'rgba(35,86,255,.12)');
    blueGlow.addColorStop(.46,'rgba(35,86,255,.04)');
    blueGlow.addColorStop(1,'rgba(35,86,255,0)');
    context.fillStyle = blueGlow;
    context.fillRect(0,0,width,height);
  }

  function drawMesh(time: number){
    const redPoints = new Path2D();
    const bluePoints = new Path2D();
    const hotPoints = new Path2D();
    const redGlowPoints = new Path2D();
    const blueGlowPoints = new Path2D();
    const pulsePosition = (time*.12)%1;

    for(let row=0;row<rows;row++){
      for(let column=0;column<columns;column++){
        const point = projectContactPoint(column, row, time, width, height, columns, rows);
        if(point.x < -30 || point.x > width+30 || point.y < -30 || point.y > height+30) continue;

        const edgeFade = clamp(point.x01/.09,0,1)*clamp((1.04-point.x01)/.08,0,1);
        const radius = (.46+point.depth*1.22)*edgeFade;
        if(radius < .08) continue;

        const blueWave = .5+.5*Math.sin(point.x01*8.6-point.z*9.8+time*.82);
        const isBlue = blueWave > .83 && point.z > .20;
        const pulse = Math.exp(-Math.pow(cyclicDistance(point.z,pulsePosition),2)/.0018);
        const peak = clamp((point.relief-.38)*.9,0,1);
        const shimmer = .5+.5*Math.sin(column*.74+row*.57+time*2.25);
        const isHot = pulse > .22 || (peak > .22 && shimmer > .78);

        addPoint(isBlue ? bluePoints : redPoints,point.x,point.y,radius);

        if(isBlue && (blueWave > .91 || pulse > .34)){
          addPoint(blueGlowPoints,point.x,point.y,radius*3.6);
        }
        if(!isBlue && (isHot || peak > .52)){
          addPoint(redGlowPoints,point.x,point.y,radius*4.1);
        }
        if(isHot){
          addPoint(hotPoints,point.x,point.y,radius*(1.20+pulse*.55));
        }
      }
    }

    context.save();
    context.globalCompositeOperation = 'lighter';

    context.globalAlpha = .34;
    context.fillStyle = '#ef3340';
    context.fill(redPoints);

    context.globalAlpha = .42;
    context.fillStyle = '#3970ff';
    context.fill(bluePoints);

    context.globalAlpha = .075;
    context.fillStyle = '#ff4a56';
    context.fill(redGlowPoints);

    context.globalAlpha = .07;
    context.fillStyle = '#7ed9ff';
    context.fill(blueGlowPoints);

    context.globalAlpha = .90;
    context.fillStyle = '#ff9ca3';
    // The batched halo paths above retain the glow without a full-path blur
    // on every frame, which is costly on constrained desktop renderers.
    context.fill(hotPoints);
    context.restore();
  }

  context.clearRect(0, 0, width, height);
  paintAmbientLights(time);
  drawMesh(time);
}
