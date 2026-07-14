/* ============================================================
   DAVI ASAFE — interactions
   ============================================================ */
(function(){
  "use strict";
  const $  = (s,c)=> (c||document).querySelector(s);
  const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- LANGUAGE ---------- */
  const LANG_KEY = "davi.lang";
  function setLang(lang){
    const isEnglish = lang === "en";
    document.documentElement.lang = isEnglish ? "en" : "pt-BR";
    $$("[data-pt]").forEach(el=>{
      const v = el.getAttribute(isEnglish ? "data-en" : "data-pt");
      if(v !== null) el.textContent = v;
    });
    $$("[data-aria-pt]").forEach(el=>{
      const v = el.getAttribute(isEnglish ? "data-aria-en" : "data-aria-pt");
      if(v !== null) el.setAttribute("aria-label", v);
    });
    $$(".lang button").forEach(b=>{
      const active = b.dataset.lang === lang;
      b.classList.toggle("on", active);
      b.setAttribute("aria-pressed", String(active));
    });
    document.title = isEnglish
      ? "Davi Asafe | Backend, Full-stack and AI"
      : "Davi Asafe | Backend, Full-stack e IA";
    const description = $("meta[name='description']");
    if(description){
      description.content = isEnglish
        ? "Davi Asafe's portfolio: Software Engineering student building backend, full-stack and artificial intelligence projects."
        : "Portfólio de Davi Asafe, estudante de Engenharia de Software focado em backend, aplicações full-stack e inteligência artificial.";
    }
    try{ localStorage.setItem(LANG_KEY, lang); }catch(e){}
    window.__lang = lang;
    startTypewriter();
  }

  /* ---------- TYPEWRITER (rotating roles) ---------- */
  const ROLES = {
    pt: ["Software Engineer", "Backend Developer", "Full-stack Developer", "AI Engineering Specialist"],
    en: ["Software Engineer", "Backend Developer", "Full-stack Developer", "AI Engineering Specialist"]
  };
  let twTimer = null;
  function startTypewriter(){
    const el = $(".type-role");
    if(!el) return;
    const roles = ROLES[window.__lang] || ROLES.pt;
    if(twTimer){ clearTimeout(twTimer); twTimer = null; }
    if(reduce){ el.textContent = roles[0]; return; }
    let roleIndex = 0, characterIndex = 0, deleting = false;
    el.textContent = "";
    function step(){
      const role = roles[roleIndex % roles.length];
      if(!deleting){
        characterIndex++;
        el.textContent = role.slice(0, characterIndex);
        if(characterIndex >= role.length){
          deleting = true;
          twTimer = setTimeout(step, 1900);
          return;
        }
        twTimer = setTimeout(step, 70 + Math.random() * 65);
      } else {
        characterIndex--;
        el.textContent = role.slice(0, characterIndex);
        if(characterIndex <= 0){
          deleting = false;
          roleIndex++;
          twTimer = setTimeout(step, 380);
          return;
        }
        twTimer = setTimeout(step, 38);
      }
    }
    twTimer = setTimeout(step, 650);
  }

  let startLang = "pt";
  try{ startLang = localStorage.getItem(LANG_KEY) || "pt"; }catch(e){}
  $$(".lang button").forEach(b=> b.addEventListener("click", ()=> setLang(b.dataset.lang)));
  setLang(startLang);

  /* ---------- RELIABLE HASH NAVIGATION ---------- */
  function scrollToHash(behavior){
    if(!window.location.hash) return;
    let id;
    try{ id = decodeURIComponent(window.location.hash.slice(1)); }catch(e){ return; }
    const target = document.getElementById(id);
    if(!target) return;
    requestAnimationFrame(()=> target.scrollIntoView({
      behavior: reduce ? "auto" : behavior,
      block: "start"
    }));
  }
  window.addEventListener("load", ()=> scrollToHash("instant"), { once:true });
  window.addEventListener("hashchange", ()=> scrollToHash("instant"));

  /* ---------- CUSTOM CURSOR ---------- */
  const dot  = $(".cursor-dot");
  const ring = $(".cursor-ring");
  if(dot && ring && window.matchMedia("(hover:hover)").matches){
    let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
    window.addEventListener("mousemove", e=>{
      mx=e.clientX; my=e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    $$("a, button, .btn, .magnetic").forEach(el=>{
      el.addEventListener("mouseenter", ()=> ring.classList.add("is-hot"));
      el.addEventListener("mouseleave", ()=> ring.classList.remove("is-hot"));
    });
  }

  /* ---------- MAGNETIC ELEMENTS ---------- */
  if(!reduce && window.matchMedia("(hover:hover)").matches){
    $$(".magnetic").forEach(el=>{
      const strength = parseFloat(el.dataset.mag || "0.35");
      el.addEventListener("mousemove", e=>{
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width/2);
        const y = e.clientY - (r.top + r.height/2);
        el.style.transform = `translate(${x*strength}px, ${y*strength}px)`;
        const lbl = el.querySelector(".lbl");
        if(lbl) lbl.style.transform = `translate(${x*strength*0.4}px, ${y*strength*0.4}px)`;
      });
      el.addEventListener("mouseleave", ()=>{
        el.style.transform = "";
        const lbl = el.querySelector(".lbl");
        if(lbl) lbl.style.transform = "";
      });
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  document.body.classList.add("anim");           // enables hidden-until-in state
  const reveals = $$(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold:0.12, rootMargin:"0px 0px -8% 0px" });
  reveals.forEach(el=> io.observe(el));
  // safety net: if anything is still hidden after 3.5s (stalled IO/transition), force it visible
  setTimeout(()=> reveals.forEach(el=> el.classList.add("in")), 3500);

  /* ---------- PARALLAX ---------- */
  if(!reduce){
    const layers = $$("[data-parallax]");
    let ticking = false;
    function onScroll(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(()=>{
        const y = window.scrollY;
        layers.forEach(l=>{
          const sp = parseFloat(l.dataset.parallax);
          l.style.transform = `translateY(${y*sp}px)`;
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive:true });
  }

  /* ---------- CLOCK ---------- */
  const clock = $(".clock");
  if(clock){
    const tick = ()=>{
      const d = new Date();
      const t = d.toLocaleTimeString("pt-BR",{ hour:"2-digit", minute:"2-digit", second:"2-digit", timeZone:"America/Sao_Paulo" });
      clock.textContent = t + " BRT";
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- LIVE TERMINAL ---------- */
  const body = $(".term-body");
  if(body){
    // each step: type a command, then print outputs
    const script = [
      { type:"cmd", text:"./davi --whoami" },
      { type:"out", text:"backend & full-stack · engenharia de software + IA" },
      { type:"gap" },
      { type:"cmd", text:"quarkus build --native" },
      { type:"out", text:"compilando AOT… reflection-free ✓" },
      { type:"ok",  text:"native-image · boot 0.017s · rss 32MB" },
      { type:"gap" },
      { type:"cmd", text:"git log --oneline -1" },
      { type:"out", text:"feat: arquitetura tão limpa quanto o código" },
      { type:"gap" },
      { type:"cmd", text:"stack --core" },
      { type:"ok",  text:"java · spring-boot · quarkus · go · postgres · docker" },
      { type:"prompt" }
    ];

    const PROMPT = '<span class="p">davi@arch</span><span class="o">:~$</span> ';
    let si = 0;
    function lineEl(){ const d = document.createElement("div"); d.className="term-line"; body.appendChild(d); return d; }

    function caretInto(el){
      const c = document.createElement("span"); c.className="caret"; el.appendChild(c); return c;
    }
    function run(){
      if(si >= script.length) return;
      const step = script[si++];
      if(step.type === "gap"){ const g = lineEl(); g.innerHTML="&nbsp;"; setTimeout(run, 160); return; }
      if(step.type === "prompt"){ const el = lineEl(); el.innerHTML = PROMPT; caretInto(el); return; }
      if(step.type === "cmd"){
        const el = lineEl(); el.innerHTML = PROMPT;
        const span = document.createElement("span"); span.className="c"; el.appendChild(span);
        const car = caretInto(el);
        let i=0; const txt = step.text;
        (function typeChar(){
          if(i < txt.length){
            span.textContent += txt[i++];
            setTimeout(typeChar, 26 + Math.random()*46);
          } else { car.remove(); setTimeout(run, 360); }
        })();
        return;
      }
      // output / ok
      const el = lineEl();
      const span = document.createElement("span");
      span.className = step.type === "ok" ? "ok" : "o";
      span.textContent = step.text;
      el.appendChild(span);
      setTimeout(run, 380);
    }
    // start when hero in view (it is, on load) — small delay after entrance
    const startT = ()=> setTimeout(run, 700);
    if(reduce){
      // render statically
      script.forEach(s=>{
        if(s.type==="gap"){ const g=lineEl(); g.innerHTML="&nbsp;"; return; }
        if(s.type==="prompt"){ const el=lineEl(); el.innerHTML=PROMPT; return; }
        const el=lineEl();
        if(s.type==="cmd"){ el.innerHTML = PROMPT + '<span class="c">'+s.text+'</span>'; }
        else{ const sp=document.createElement("span"); sp.className = s.type==="ok"?"ok":"o"; sp.textContent=s.text; el.appendChild(sp); }
      });
    } else { startT(); }
  }

  /* ---------- PROJECT IMAGE LIGHTBOX ---------- */
  const lightbox = $(".lightbox");
  if(lightbox){
    const lightboxImage = $(".lightbox-image", lightbox);
    const lightboxCaption = $(".lightbox-caption", lightbox);
    const lightboxClose = $(".lightbox-close", lightbox);
    let lightboxOpener = null;
    let closeTimer = null;

    function openLightbox(button){
      const image = $("img", button);
      const project = button.closest(".case");
      const title = $(".case-name", project);
      const label = $(".mtag", project);
      if(!image) return;
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      lightboxOpener = button;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = [title && title.textContent, label && label.textContent].filter(Boolean).join(" · ");
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      requestAnimationFrame(()=>{
        lightbox.classList.add("is-open");
        lightboxClose.focus();
      });
    }

    function closeLightbox(){
      if(lightbox.hidden) return;
      lightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      closeTimer = setTimeout(()=>{
        lightbox.hidden = true;
        lightboxImage.src = "";
        if(lightboxOpener) lightboxOpener.focus();
        lightboxOpener = null;
      }, reduce ? 0 : 360);
    }

    $$(".media-open").forEach(button=> button.addEventListener("click", ()=> openLightbox(button)));
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", event=>{ if(event.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", event=>{
      if(lightbox.hidden) return;
      if(event.key === "Escape") closeLightbox();
      if(event.key === "Tab"){
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  /* ---------- year ---------- */
  const yr = $(".yr"); if(yr) yr.textContent = new Date().getFullYear();
})();
