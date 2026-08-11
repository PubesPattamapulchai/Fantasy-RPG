(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const snap = () => window.EmberfallBridge?.snapshot?.();
  const moveKeys = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
  const actionKeys = {
    '1':'attack','2':'skill1','3':'skill2','4':'guard','5':'potion','6':'bomb','7':'burst','8':'tactic','9':'inspire','0':'dodge',
    'q':'weaponTechnique','p':'parry','x':'execute','e':'environment','t':'partyTactic'
  };
  const blockedTiles = new Set(['#','T','B','W','M','R','L','~']);
  const runtime = { queued:null, queuedAt:0, held:new Map(), path:[], timer:0, interact:false, goal:null, pointerDown:null };

  function visibleButton(action){return [...document.querySelectorAll(`[data-action="${action}"]`)].find(b=>b.offsetParent!==null)||null;}

  function ensureQueueChip(){
    const battle=$('#battleScreen');if(!battle||$('#actionQueueChip'))return;
    const el=document.createElement('div');el.id='actionQueueChip';el.className='action-queue-chip hidden';el.innerHTML='<small>INPUT BUFFER</small><strong>READY</strong>';battle.appendChild(el);
  }

  function showQueue(action){ensureQueueChip();const chip=$('#actionQueueChip');if(!chip)return;chip.classList.remove('hidden');chip.querySelector('strong').textContent=action.replace(/([A-Z])/g,' $1').toUpperCase();}
  function clearQueue(){runtime.queued=null;$('#actionQueueChip')?.classList.add('hidden');}
  function queueAction(action){runtime.queued=action;runtime.queuedAt=performance.now();showQueue(action);}

  function flushQueue(){
    if(!runtime.queued)return;const s=snap();if(!s?.inBattle||performance.now()-runtime.queuedAt>2200){clearQueue();return;}
    const btn=visibleButton(runtime.queued);if(btn&&!btn.disabled){const action=runtime.queued;clearQueue();btn.click();window.dispatchEvent(new CustomEvent('emberfall:bufferedaction',{detail:{action}}));return;}
    // If the turn is available again but the button is still disabled, the action is genuinely
    // unavailable (cost/cooldown/etc.) and must not unexpectedly fire later.
    if(!s.battleLocked&&!s.timingActive)clearQueue();
  }

  function overlayOpen(){return !!document.querySelector('.menu-overlay:not(.hidden), .dialogue:not(.hidden), #titleScreen:not(.hidden)');}

  function startHold(key){
    const k=String(key).toLowerCase();if(!moveKeys.has(k)||runtime.held.has(k))return;
    const rec={timeout:null,interval:null,key};
    rec.timeout=setTimeout(()=>{rec.interval=setInterval(()=>{const s=snap();if(!s?.started||s.inBattle||overlayOpen())return;document.dispatchEvent(new KeyboardEvent('keydown',{key:rec.key,bubbles:true,cancelable:true}));},82);},135);
    runtime.held.set(k,rec);
  }
  function stopHold(key){const k=String(key||'').toLowerCase(),rec=runtime.held.get(k);if(!rec)return;clearTimeout(rec.timeout);clearInterval(rec.interval);runtime.held.delete(k);}
  function stopAll(){[...runtime.held.keys()].forEach(stopHold);}

  document.addEventListener('keydown',e=>{
    if(!e.isTrusted||e.ctrlKey||e.metaKey||e.altKey)return;const s=snap(),key=e.key.toLowerCase();
    if(s?.inBattle&&actionKeys[key]){const action=actionKeys[key],btn=visibleButton(action);if((!btn||btn.disabled)&&(s.battleLocked||s.timingActive)){queueAction(action);e.preventDefault();e.stopImmediatePropagation();return;}}
    if(!s?.inBattle&&s?.started&&moveKeys.has(key)&&!e.repeat){runtime.path=[];startHold(e.key);}
  },true);
  document.addEventListener('keyup',e=>stopHold(e.key),true);
  window.addEventListener('blur',stopAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
  document.addEventListener('pointerdown',e=>{const btn=e.target?.closest?.('[data-action]'),s=snap();if(!btn||!s?.inBattle||!btn.disabled||(!s.battleLocked&&!s.timingActive))return;queueAction(btn.dataset.action);e.preventDefault();},true);

  function passable(s,x,y,goal=null){
    const map=s?.locationData?.map||[];if(y<0||y>=map.length||x<0||x>=(map[y]?.length||0))return false;
    // Terrain validity is checked before the goal exception, so clicking a wall/tree/building
    // cannot create a path whose final step is impossible.
    if(blockedTiles.has(map[y][x]))return false;if(goal&&goal.x===x&&goal.y===y)return true;
    const occupied=[...(s.locationData?.npcs||[]),...(s.locationData?.enemies||[]).filter(e=>!e.defeated)].some(o=>o.x===x&&o.y===y);return !occupied;
  }

  function pathfind(s,target){
    const start={x:s.player.x,y:s.player.y};if(start.x===target.x&&start.y===target.y)return [];
    const q=[start],seen=new Map([[`${start.x},${start.y}`,null]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let qi=0;qi<q.length&&qi<700;qi++){
      const cur=q[qi];for(const [dx,dy] of dirs){const nx=cur.x+dx,ny=cur.y+dy,key=`${nx},${ny}`;if(seen.has(key)||!passable(s,nx,ny,target))continue;seen.set(key,cur);q.push({x:nx,y:ny});if(nx===target.x&&ny===target.y){const out=[];let p={x:nx,y:ny};while(p.x!==start.x||p.y!==start.y){out.push(p);p=seen.get(`${p.x},${p.y}`);}return out.reverse();}}
    }
    return null;
  }

  function actorAt(s,t){
    const all=[...(s.locationData?.npcs||[]).map(o=>({...o,kind:'npc'})),...(s.locationData?.chests||[]).map(o=>({...o,kind:'chest'})),...(s.locationData?.nodes||[]).map(o=>({...o,kind:'node'})),...(s.locationData?.enemies||[]).filter(e=>!e.defeated).map(o=>({...o,kind:'enemy'})),...(s.locationData?.exits||[]).map(o=>({...o,kind:'exit'}))];
    return all.find(o=>o.x===t.x&&o.y===t.y)||null;
  }

  function bestAdjacent(s,actor){
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]],candidates=dirs.map(([dx,dy])=>({x:actor.x+dx,y:actor.y+dy})).filter(p=>passable(s,p.x,p.y));
    candidates.sort((a,b)=>Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)-Math.abs(b.x-s.player.x)-Math.abs(b.y-s.player.y));
    for(const c of candidates){const p=pathfind(s,c);if(p)return{target:c,path:p};}return null;
  }

  function moveKey(dx,dy){return dx===1?'ArrowRight':dx===-1?'ArrowLeft':dy===1?'ArrowDown':'ArrowUp';}

  function startPath(tile){
    const s=snap();if(!s?.started||s.inBattle||overlayOpen())return;const actor=actorAt(s,tile);let path,target=tile,interact=false;
    if(actor&&['npc','chest','node'].includes(actor.kind)){const adj=bestAdjacent(s,actor);if(!adj)return;path=adj.path;target=adj.target;interact=true;}else path=pathfind(s,tile);
    if(!path)return;runtime.path=path;runtime.goal=target;runtime.interact=interact;runtime.timer=0;showPing(tile,actor?'interact':'move');
  }

  function showPing(tile,kind){
    const canvas=window.Emberfall2D?.canvas;if(!canvas)return;const point=window.Emberfall2D?.tileToScreen?.(tile.x,tile.y);if(!point)return;
    const ping=document.createElement('div');ping.className=`modern2d-ping ${kind}`;ping.style.left=`${point.x}px`;ping.style.top=`${point.y}px`;canvas.parentElement?.appendChild(ping);setTimeout(()=>ping.remove(),620);
  }

  function updatePath(dt){
    if(!runtime.path.length)return;const s=snap();if(!s?.started||s.inBattle||overlayOpen()){runtime.path=[];return;}runtime.timer-=dt;if(runtime.timer>0)return;
    const next=runtime.path[0],dx=next.x-s.player.x,dy=next.y-s.player.y;if(Math.abs(dx)+Math.abs(dy)!==1){runtime.path=[];return;}
    document.dispatchEvent(new KeyboardEvent('keydown',{key:moveKey(dx,dy),bubbles:true,cancelable:true}));runtime.timer=.10;
    setTimeout(()=>{const now=snap();if(!now||!runtime.path.length)return;if(now.player.x===next.x&&now.player.y===next.y){runtime.path.shift();if(!runtime.path.length&&runtime.interact){runtime.interact=false;setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})),85);}}else{runtime.path=[];runtime.interact=false;}},74);
  }

  function installPointer(){
    const wait=()=>{const canvas=window.Emberfall2D?.canvas;if(!canvas){setTimeout(wait,80);return;}canvas.style.pointerEvents='auto';
      canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;runtime.pointerDown={x:e.clientX,y:e.clientY,t:performance.now()};});
      canvas.addEventListener('pointerup',e=>{const d=runtime.pointerDown;runtime.pointerDown=null;if(!d||snap()?.inBattle)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12||performance.now()-d.t>700)return;const tile=window.Emberfall2D.screenToTile?.(e.clientX,e.clientY);if(tile)startPath(tile);});
    };wait();
  }

  function ensureFriendlyHints(){
    const note=document.querySelector('.desktop-note');if(note)note.textContent='WASD / arrows · hold to move · click destination · Enter interact · 1–0 combat shortcuts · G gear · C sheet';
    const mobile=document.querySelector('.mobile-note');if(mobile)mobile.textContent='Tap the world to move, use the touch pad for precise movement, and tap ACT to interact.';
  }

  let last=performance.now();function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;flushQueue();updatePath(dt);requestAnimationFrame(loop);}ensureQueueChip();ensureFriendlyHints();installPointer();requestAnimationFrame(loop);
})();