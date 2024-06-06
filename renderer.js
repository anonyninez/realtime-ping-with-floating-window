const canvas = document.getElementById('pingCanvas');
const ctx = canvas.getContext('2d');
const { ipcRenderer } = require('electron');
const interval = 100;
let pingData = [];
ipcRenderer.on('ping', (event, data) => {
  if (data.alive){
    pingData.push(data.time);
  }else{
    pingData.push(pingData[pingData.length-1] + interval);
  }
    // document.getElementById("text").textContent = data.time || 0;
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
  console.log(step)

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
  ctx.moveTo(0, canvas.height);
  for (let i = 0; i < pingData.length; i++) {
    const x = (i / (pingData.length - 1)) * canvas.width;
    const y = canvas.height - (pingData[i] / (numSteps * step)) * canvas.height;
    ctx.lineTo(x, y);
  }

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.stroke();
}

window.addEventListener('resize', drawGraph);
