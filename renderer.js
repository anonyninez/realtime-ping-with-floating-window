const canvas = document.getElementById('pingCanvas');
const ctx = canvas.getContext('2d');
const { ipcRenderer } = require('electron')

let sysColor = "";
let pingData = [0];
let maxping = 2000;
var lastpl = new Date().getTime();
function isFloat(n) {
  return n === +n && n !== (n|0);
}

ipcRenderer.on('set-value', (event, [c, m]) => {
  sysColor = '#' + c.slice(0,-2);
  maxping = m;
});
console.log(sysColor)
var ping = 0;
ipcRenderer.on('ping', (event, data) => {
  if (data.alive){
    ping = data.time;
  }else if(data.pl === '100.000'){
    ping += maxping;
  }else{
    ping += new Date().getTime() - lastpl;
  }
  lastpl = new Date().getTime();
  pingData.push(ping);
  // document.getElementById("text").textContent = ping;
  if (pingData.length > 100) pingData.shift();  // Keep last 100 pings
  drawGraph();
});

function drawGraph() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const minPingScale = 50; 
  const maxPing = Math.max(Math.max(...pingData), minPingScale) * 1.2;
  let step = Math.ceil(maxPing / canvas.height * 4) * 10  ;  

  const numSteps = Math.ceil(maxPing / step);

  // Draw horizontal grid lines
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 0.5;
  ctx.font = '12px Arial';
  ctx.fillStyle = 'white';

  for (let i = 0; i <= numSteps; i++) {
    const y = canvas.height - (i / numSteps) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.fillText((i * step).toFixed(0), 2, y - 2);
  }

  // Draw ping data
  ctx.beginPath();
  ctx.moveTo(-2, canvas.height);
  for (let i = 0; i < pingData.length; i++) {
    const x = (i / (pingData.length - 1)) * canvas.width;
    const y = canvas.height - (pingData[i] / (numSteps * step)) * canvas.height;
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = sysColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

window.addEventListener('resize', drawGraph);
