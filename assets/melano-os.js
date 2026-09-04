(() => {
  'use strict';

  const COMMANDS = ['help', 'luxia', 'demo', 'ecosystem', 'status', 'contact', 'about', 'clear'];
  const FIXED_URLS = Object.freeze({
    luxia: 'https://luxia.melanoinc.com',
    contact: 'mailto:contacto@melanoinc.com'
  });

  const style = document.createElement('style');
  style.textContent = `
    .melano-os-launcher{position:fixed;right:22px;bottom:22px;z-index:80;width:54px;height:54px;border-radius:16px;border:1px solid rgba(192,199,209,.35);background:rgba(8,11,16,.92);color:#f5f8fb;font:700 17px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;box-shadow:0 16px 45px rgba(0,0,0,.36);backdrop-filter:blur(16px);cursor:pointer;transition:.2s}.melano-os-launcher:hover{transform:translateY(-2px);border-color:rgba(66,232,255,.55);box-shadow:0 18px 50px rgba(24,168,255,.16)}.melano-os-launcher:focus-visible,.melano-os-input:focus-visible,.melano-os-close:focus-visible{outline:2px solid #42e8ff;outline-offset:2px}
    .melano-os-panel{position:fixed;right:22px;bottom:88px;z-index:81;width:min(360px,calc(100vw - 28px));height:min(420px,calc(100vh - 120px));display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(192,199,209,.26);border-radius:18px;background:rgba(5,7,10,.97);box-shadow:0 24px 70px rgba(0,0,0,.5);backdrop-filter:blur(22px);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.melano-os-panel[data-open="true"]{display:flex;animation:melanoOsIn .16s ease-out}.melano-os-head{height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))}.melano-os-title{display:flex;align-items:center;gap:8px;color:#c0c7d1;font-size:11px;letter-spacing:.12em}.melano-os-dot{width:7px;height:7px;border-radius:50%;background:#42e8ff;box-shadow:0 0 12px rgba(66,232,255,.7)}.melano-os-close{border:0;background:transparent;color:#98a4b3;font:500 20px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;cursor:pointer}.melano-os-close:hover{color:#fff}.melano-os-output{flex:1;overflow:auto;padding:15px 15px 8px;scrollbar-width:thin;scrollbar-color:#303844 transparent}.melano-os-line{white-space:pre-wrap;word-break:break-word;margin:0 0 8px;color:#cfd7df;font-size:12px;line-height:1.55}.melano-os-line.command{color:#f5f8fb}.melano-os-line.command::before{content:'> ';color:#42e8ff}.melano-os-line.system{color:#98a4b3}.melano-os-line.ok{color:#77efbf}.melano-os-line.warn{color:#d6b875}.melano-os-inputrow{display:flex;align-items:center;gap:8px;padding:11px 13px 13px;border-top:1px solid rgba(255,255,255,.08);background:#070a0f}.melano-os-prompt{color:#42e8ff;font-weight:700}.melano-os-input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#fff;font:500 13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;caret-color:#42e8ff}.melano-os-input::placeholder{color:#66717e}.melano-os-hint{padding:0 13px 10px;background:#070a0f;color:#66717e;font-size:10px;line-height:1.4}.melano-os-link{color:#42e8ff;text-decoration:underline;text-underline-offset:2px}.melano-os-panel a:focus-visible{outline:2px solid #42e8ff;outline-offset:2px}
    @keyframes melanoOsIn{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
    @media(max-width:620px){.melano-os-launcher{right:14px;bottom:14px}.melano-os-panel{right:14px;bottom:78px;width:calc(100vw - 28px);height:min(430px,calc(100dvh - 100px))}}
    @media(prefers-reduced-motion:reduce){.melano-os-panel[data-open="true"]{animation:none}.melano-os-launcher{transition:none}}
  `;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'melano-os-launcher';
  launcher.setAttribute('aria-label', 'Abrir MELANO OS');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.textContent = '>_';

  const panel = document.createElement('section');
  panel.className = 'melano-os-panel';
  panel.dataset.open = 'false';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'MELANO OS Interactive Command Console');
  panel.innerHTML = `
    <div class="melano-os-head">
      <div class="melano-os-title"><span class="melano-os-dot" aria-hidden="true"></span>MELANO OS / COMMAND</div>
      <button type="button" class="melano-os-close" aria-label="Cerrar consola">×</button>
    </div>
    <div class="melano-os-output" role="log" aria-live="polite" aria-relevant="additions"></div>
    <div class="melano-os-inputrow"><span class="melano-os-prompt" aria-hidden="true">›</span><input class="melano-os-input" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Comando MELANO OS" placeholder="help"></div>
    <div class="melano-os-hint">TAB autocompleta · ↑↓ historial · ESC cierra</div>
  `;

  document.body.append(launcher, panel);

  const output = panel.querySelector('.melano-os-output');
  const input = panel.querySelector('.melano-os-input');
  const close = panel.querySelector('.melano-os-close');
  const history = [];
  let historyIndex = 0;
  let booted = false;

  function emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(`melano:${name}`, { detail }));
  }

  function line(text, type = '') {
    const el = document.createElement('div');
    el.className = `melano-os-line ${type}`.trim();
    el.textContent = String(text);
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
    return el;
  }

  function linkLine(label, href) {
    const row = document.createElement('div');
    row.className = 'melano-os-line';
    const a = document.createElement('a');
    a.className = 'melano-os-link';
    a.textContent = label;
    a.href = href;
    if (href.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    row.appendChild(a);
    output.appendChild(row);
    output.scrollTop = output.scrollHeight;
  }

  function openPanel() {
    panel.dataset.open = 'true';
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Cerrar MELANO OS');
    if (!booted) {
      line('MELANO INC / INTERACTIVE COMMAND CONSOLE', 'system');
      line('Public safe mode · v1.0', 'system');
      line('Escribí “help” para ver comandos.', 'system');
      booted = true;
    }
    setTimeout(() => input.focus(), 0);
    emit('console_open');
  }

  function closePanel() {
    panel.dataset.open = 'false';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Abrir MELANO OS');
    launcher.focus();
    emit('console_close');
  }

  function togglePanel() {
    panel.dataset.open === 'true' ? closePanel() : openPanel();
  }

  function fixedOpen(url) {
    window.open(url, '_blank', 'noopener');
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    return true;
  }

  async function publicStatus() {
    line('Checking public MELANO INC surface…', 'system');
    const checks = [
      ['WEB', '/'],
      ['ASSETS', '/api/logo'],
      ['PRIVACY', '/privacidad/']
    ];
    for (const [name, url] of checks) {
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        line(`${name.padEnd(8)} ${res.ok ? 'ONLINE' : `HTTP ${res.status}`}`, res.ok ? 'ok' : 'warn');
      } catch (_) {
        line(`${name.padEnd(8)} UNAVAILABLE`, 'warn');
      }
    }
    line('Infraestructura privada: visible sólo desde Command Center.', 'system');
  }

  const handlers = Object.freeze({
    help() {
      line('Comandos disponibles:', 'system');
      line('  luxia       Abrir LUXIA');
      line('  demo        Ir al diagnóstico/demo');
      line('  ecosystem   Ver arquitectura MELANO INC');
      line('  status      Estado público del sitio');
      line('  contact     Contactar MELANO INC');
      line('  about       Qué es MELANO OS');
      line('  clear       Limpiar consola');
    },
    luxia() {
      line('Abriendo LUXIA…', 'ok');
      fixedOpen(FIXED_URLS.luxia);
    },
    demo() {
      if (scrollToId('contacto')) {
        line('Diagnóstico cargado. Completá el formulario para solicitar demo.', 'ok');
        closePanel();
      } else line('Sección de diagnóstico no disponible.', 'warn');
    },
    ecosystem() {
      if (scrollToId('ecosistema')) {
        line('Arquitectura MELANO INC localizada.', 'ok');
        closePanel();
      } else line('Sección de ecosistema no disponible.', 'warn');
    },
    status() {
      return publicStatus();
    },
    contact() {
      line('Canal de contacto: contacto@melanoinc.com', 'ok');
      linkLine('Escribir a contacto@melanoinc.com', FIXED_URLS.contact);
    },
    about() {
      line('MELANO OS es la interfaz de comandos del ecosistema MELANO INC.', 'system');
      line('Esta versión pública sólo ejecuta acciones predefinidas del sitio.', 'system');
      line('No existe acceso a shell, SQL, Git, npm ni infraestructura privada.', 'system');
    },
    clear() {
      output.replaceChildren();
    }
  });

  async function execute(raw) {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    line(raw.trim(), 'command');
    history.push(raw.trim());
    historyIndex = history.length;
    emit('command', { command: COMMANDS.includes(command) ? command : 'unknown' });

    const handler = handlers[command];
    if (!handler) {
      const blocked = /^(rm|npm|git|curl|wget|exec|bash|sh|zsh|sql|psql|node|python|sudo)(\s|$)/i.test(command);
      if (blocked) {
        line('BLOCKED: public safe mode no ejecuta comandos de sistema.', 'warn');
      } else {
        line(`Comando no reconocido: ${command}`, 'warn');
        line('Usá “help” para ver la allowlist.', 'system');
      }
      return;
    }
    await handler();
  }

  launcher.addEventListener('click', togglePanel);
  close.addEventListener('click', closePanel);

  input.addEventListener('keydown', async event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = input.value;
      input.value = '';
      await execute(value);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || '';
      input.setSelectionRange(input.value.length, input.value.length);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex === history.length ? '' : (history[historyIndex] || '');
      input.setSelectionRange(input.value.length, input.value.length);
      return;
    }
    if (event.key === 'Tab') {
      const query = input.value.trim().toLowerCase();
      if (!query) return;
      const matches = COMMANDS.filter(cmd => cmd.startsWith(query));
      if (matches.length === 1) {
        event.preventDefault();
        input.value = matches[0];
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.dataset.open === 'true' && document.activeElement !== input) closePanel();
    if (event.altKey && event.key.toLowerCase() === 'm') {
      event.preventDefault();
      togglePanel();
    }
  });
})();
