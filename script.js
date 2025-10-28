const procListEl = document.getElementById('procList');
const logEl = document.getElementById('logOutput');
const statCount = document.getElementById('statCount');
const statMax = document.getElementById('statMax');
const statState = document.getElementById('statState');
const statTotal = document.getElementById('statTotal');

const procNameInput = document.getElementById('procName');
const procDurInput = document.getElementById('procDur');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const preset1 = document.getElementById('preset1');
const preset2 = document.getElementById('preset2');
const preset3 = document.getElementById('preset3');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');

let processes = [];
let running = false;
let controller = { cancel:false };

function uid(){ return Math.random().toString(36).slice(2,9); }

function renderList(){
  procListEl.innerHTML = '';
  processes.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'proc';
    el.dataset.id = p.id;
    el.innerHTML = `
      <div class="meta">
        <div class="title">${p.name} <small style="color:var(--muted);font-weight:600">(${p.duration}s)</small></div>
        <div class="sub">Status: <span class="st">${p.status}</span></div>
        <div class="bar"><i style="width:${p.progress}%"></i></div>
      </div>
      <div class="actions">
        <button class="btn-edit" title="Edit">✏</button>
        <button class="btn-remove" title="Remove">🗑</button>
      </div>
    `;
    procListEl.appendChild(el);

    el.querySelector('.btn-remove').addEventListener('click', ()=>{
      processes = processes.filter(x=>x.id!==p.id);
      log(Removed ${p.name});
      updateStats();
      renderList();
    });
    el.querySelector('.btn-edit').addEventListener('click', ()=>{
      const newName = prompt('Nama proses:', p.name);
      const newDur = prompt('Durasi (detik):', p.duration);
      if(newName!==null && newName.trim()!=='') p.name = newName.trim();
      const nd = parseFloat(newDur);
      if(!isNaN(nd) && nd>0) p.duration = nd;
      renderList();
      updateStats();
    });
  });
}

function addProcess(name, duration){
  const p = { id: uid(), name: name || P${processes.length+1}, duration: Number(duration) || 1, status:'idle', progress:0, startedAt:null, finishedAt:null };
  processes.push(p);
  log(Added ${p.name} (${p.duration}s));
  renderList();
  updateStats();
}

addBtn.addEventListener('click', ()=>{
  const name = procNameInput.value.trim();
  const dur = parseFloat(procDurInput.value);
  if(!name){ procNameInput.focus(); return }
  if(isNaN(dur) || dur <= 0){ procDurInput.focus(); return }
  addProcess(name, dur);
  procNameInput.value = '';
  procDurInput.value = '';
});

clearBtn.addEventListener('click', ()=>{
  if(confirm('Hapus semua proses?')) {
    processes = [];
    renderList();
    log('Cleared all processes.');
    updateStats();
  }
});

preset1.addEventListener('click', ()=> {
  processes = [];
  addProcess('P1',2); addProcess('P2',3); addProcess('P3',4);
  renderList(); updateStats();
});
preset2.addEventListener('click', ()=>{
  processes = [];
  for(let i=1;i<=5;i++) addProcess('P'+i, Math.round((Math.random()*4+1)*10)/10);
  renderList(); updateStats();
});
preset3.addEventListener('click', ()=> { logEl.innerHTML = ''; log('Log cleared.'); });

function log(txt){
  const time = new Date().toLocaleTimeString();
  const line = [${time}] ${txt};
  const node = document.createElement('div');
  node.textContent = line;
  logEl.appendChild(node);
  logEl.scrollTop = logEl.scrollHeight;
}

function updateStats(){
  statCount.textContent = processes.length;
  statMax.textContent = processes.length ? Math.max(...processes.map(p=>p.duration)) : 0;
  statState.textContent = running ? 'Running' : 'Idle';
}

async function runParbegin(){
  if(running) return;
  if(processes.length === 0){ alert('Belum ada proses. Tambah dulu.'); return; }

  running = true;
  controller.cancel = false;
  updateStats();
  statTotal.textContent = '-';
  log('=== PARBEGIN START ===');

  processes.forEach(p=>{ p.status='queued'; p.progress=0; p.startedAt=null; p.finishedAt=null; });

  renderList();

  const startT = performance.now();
  const tasks = processes.map(p => runProcessSim(p, controller));
  await Promise.all(tasks);
  const endT = performance.now();

  if(!controller.cancel){
    log('=== PAREND: Semua proses selesai ===');
    const totalSec = ((endT - startT)/1000).toFixed(2);
    statTotal.textContent = totalSec;
    log(Total waktu (realtime): ${totalSec}s);
  } else {
    log('=== PAREND: Dibatalkan oleh user ===');
  }

  running = false;
  updateStats();
}

function runProcessSim(p, controllerRef){
  return new Promise(resolve=>{
    p.status = 'running';
    p.startedAt = Date.now();
    log(${p.name} dimulai (durasi ${p.duration}s));
    renderList();

    const totalMs = Math.max(1, Math.round(p.duration*1000));
    const tick = 100;
    const steps = Math.ceil(totalMs / tick);
    let step = 0;

    const iv = setInterval(()=>{
      if(controllerRef.cancel){
        clearInterval(iv);
        p.status = 'cancelled';
        p.progress = 0;
        p.finishedAt = Date.now();
        renderList();
        log(${p.name} dibatalkan);
        resolve();
        return;
      }
      step++;
      p.progress = Math.min(100, Math.round((step/steps)*100));
      renderList();
    }, tick);

    setTimeout(()=>{
      clearInterval(iv);
      p.progress = 100;
      p.status = 'done';
      p.finishedAt = Date.now();
      renderList();
      const elapsed = ((p.finishedAt - p.startedAt)/1000).toFixed(2);
      log(${p.name} selesai (elapsed ${elapsed}s));
      resolve();
    }, totalMs);
  });
}

startBtn.addEventListener('click', ()=>{
  if(running){ alert('Simulasi sedang berjalan'); return; }
  runParbegin();
  updateStats();
});

stopBtn.addEventListener('click', ()=>{
  if(!running){ alert('Tidak ada simulasi berjalan'); return; }
  if(confirm('Hentikan simulasi sekarang?')) {
    controller.cancel = true;
    statState.textContent = 'Stopping...';
  }
});

exportBtn.addEventListener('click', ()=>{
  const txt = Array.from(logEl.children).map(n=>n.textContent).join("\n");
  const blob = new Blob([txt], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'parbegin_log.txt';
  a.click();
  URL.revokeObjectURL(url);
});

resetBtn.addEventListener('click', ()=>{
  if(!confirm('Reset aplikasi (hapus semua proses & log)?')) return;
  processes = [];
  logEl.innerHTML = '';
  renderList();