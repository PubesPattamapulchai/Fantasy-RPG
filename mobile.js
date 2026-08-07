(() => {
  'use strict';

  const coarse = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  if (coarse) document.body.classList.add('mobile-device');

  const $ = id => document.getElementById(id);
  const vibrate = pattern => {
    if (coarse && navigator.vibrate) navigator.vibrate(pattern);
  };

  const dispatchKey = key => document.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true
  }));

  // Mirror the desktop HUD into a compact in-game mobile status bar.
  const syncStatus = () => {
    const job = $('jobText')?.textContent || 'WAYFARER';
    const level = $('levelText')?.textContent || '1';
    const hp = $('hpText')?.textContent?.replaceAll(' ', '') || '40/40';
    const mp = $('mpText')?.textContent?.replaceAll(' ', '') || '14/14';
    $('mobileJobText').textContent = `${job} · LV ${level}`;
    $('mobileHpText').textContent = hp;
    $('mobileMpText').textContent = mp;
    $('mobileGoldText').textContent = $('goldText')?.textContent || '0';
  };

  const observed = ['jobText', 'levelText', 'hpText', 'mpText', 'goldText'];
  const observer = new MutationObserver(syncStatus);
  observed.forEach(id => {
    const node = $(id);
    if (node) observer.observe(node, { subtree: true, childList: true, characterData: true });
  });
  syncStatus();

  // Hide movement controls whenever a full-screen menu or battle owns the screen.
  const syncScreenMode = () => {
    const visible = id => {
      const node = $(id);
      return node && !node.classList.contains('hidden');
    };
    document.body.classList.toggle('front-screen', visible('titleScreen') || visible('jobScreen'));
    document.body.classList.toggle('battle-active', visible('battleScreen'));
    document.body.classList.toggle('menu-active', visible('gearScreen') || visible('sheetScreen') || visible('campScreen') || visible('shopScreen') || visible('eventScreen') || visible('companionScreen'));
    document.body.classList.toggle('dialogue-active', visible('dialogueBox'));
    document.body.classList.toggle('ending-active', visible('endingScreen'));
  };
  ['titleScreen', 'jobScreen', 'companionScreen', 'battleScreen', 'gearScreen', 'sheetScreen', 'campScreen', 'shopScreen', 'eventScreen', 'dialogueBox', 'endingScreen'].forEach(id => {
    const node = $(id);
    if (node) new MutationObserver(syncScreenMode).observe(node, { attributes: true, attributeFilter: ['class'] });
  });
  syncScreenMode();

  // Hold a direction to keep walking. A quick press still moves one tile.
  const directionKeys = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
  document.querySelectorAll('[data-move]').forEach(button => {
    let delayTimer = 0;
    let repeatTimer = 0;
    const stop = () => {
      clearTimeout(delayTimer);
      clearInterval(repeatTimer);
      delayTimer = 0;
      repeatTimer = 0;
      button.classList.remove('pressed');
    };
    const start = event => {
      event.preventDefault();
      stop();
      button.classList.add('pressed');
      vibrate(8);
      dispatchKey(directionKeys[button.dataset.move]);
      delayTimer = setTimeout(() => {
        repeatTimer = setInterval(() => dispatchKey(directionKeys[button.dataset.move]), 105);
      }, 240);
    };
    button.addEventListener('pointerdown', start, { passive: false });
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });

  // Swipe across the world to move one tile. Diagonal swipes choose the strongest axis.
  const canvas = $('gameCanvas');
  let swipeStart = null;
  if (canvas) {
    canvas.addEventListener('pointerdown', event => {
      if (!coarse) return;
      swipeStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    }, { passive: true });
    canvas.addEventListener('pointerup', event => {
      if (!swipeStart || !coarse) return;
      const dx = event.clientX - swipeStart.x;
      const dy = event.clientY - swipeStart.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = performance.now() - swipeStart.time;
      swipeStart = null;
      if (distance < 28 || elapsed > 650) return;
      vibrate(6);
      if (Math.abs(dx) > Math.abs(dy)) dispatchKey(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
      else dispatchKey(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }, { passive: true });
  }

  // Mobile shortcuts use the existing tested game buttons.
  const proxyClick = (sourceId, targetId, haptic = 10) => {
    $(sourceId)?.addEventListener('click', event => {
      event.preventDefault();
      vibrate(haptic);
      $(targetId)?.click();
    });
  };
  proxyClick('mobileGearBtn', 'gearBtn');
  proxyClick('mobileSheetBtn', 'sheetBtn');
  proxyClick('mobileCampBtn', 'campBtn');
  proxyClick('mobileGearActionBtn', 'gearBtn');
  proxyClick('mobileSaveBtn', 'saveBtn');
  proxyClick('mobileSoundBtn', 'soundBtn');
  $('actionBtn')?.addEventListener('click', () => vibrate(10));
  document.querySelectorAll('.battle-actions button, .camp-choice, .event-choice, #timingHitBtn, #dialogueNext').forEach(button => {
    button.addEventListener('click', () => vibrate(12));
  });

  const fullscreenButtons = [$('fullscreenBtn'), $('mobileFullscreenBtn')].filter(Boolean);
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const requestFullscreen = async () => {
    const root = document.documentElement;
    try {
      if (fullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (root.requestFullscreen) {
        await root.requestFullscreen({ navigationUI: 'hide' });
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      }
    } catch (_) {
      // Some mobile browsers only allow fullscreen after installation.
    }
  };
  fullscreenButtons.forEach(button => button.addEventListener('click', () => {
    vibrate(15);
    requestFullscreen();
  }));
  const syncFullscreenLabel = () => {
    const label = fullscreenElement() ? 'EXIT FULL' : 'FULLSCREEN';
    if ($('fullscreenBtn')) $('fullscreenBtn').textContent = label;
    if ($('mobileFullscreenBtn')) $('mobileFullscreenBtn').textContent = fullscreenElement() ? 'EXIT' : 'FULL';
  };
  document.addEventListener('fullscreenchange', syncFullscreenLabel);
  document.addEventListener('webkitfullscreenchange', syncFullscreenLabel);

  // Install prompt for Chromium-based mobile browsers.
  let deferredInstall = null;
  const installBtn = $('installBtn');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event;
    installBtn?.classList.remove('hidden');
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    installBtn.classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => installBtn?.classList.add('hidden'));

  // Wake lock keeps long battles from dimming the phone, where supported.
  let wakeLock = null;
  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch (_) {}
  };
  if (coarse) {
    document.addEventListener('pointerdown', requestWakeLock, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && wakeLock) requestWakeLock();
    });
  }

  // Register offline cache. GitHub Pages serves this securely over HTTPS.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
})();
