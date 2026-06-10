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
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    $$("[data-pt]").forEach(el=>{
      const v = el.getAttribute(lang === "en" ? "data-en" : "data-pt");
      if(v !== null) el.textContent = v;
    });
    $$(".lang button").forEach(b=> b.classList.toggle("on", b.dataset.lang === lang));
    try{ localStorage.setItem(LANG_KEY, lang); }catch(e){}
    window.__lang = lang;
    startTypewriter();
  }

  /* ---------- TYPEWRITER (rotating roles) ---------- */
  const ROLES = {
    pt: ["Backend Developer", "Full-stack Developer", "AI Engineering Specialist"],
    en: ["Backend Developer", "Full-stack Developer", "AI Engineering Specialist"]
  };
  let twTimer = null;
  function startTypewriter(){
    const el = $(".type-role");
    if(!el) return;
    const roles = ROLES[window.__lang] || ROLES.pt;
    if(twTimer){ clearTimeout(twTimer); twTimer = null; }
    if(reduce){ el.textContent = roles[0]; return; }
    let ri = 0, ci = 0, del = false;
    el.textContent = "";
    function step(){
      const w = roles[ri % roles.length];
      if(!del){
        ci++; el.textContent = w.slice(0, ci);
        if(ci >= w.length){ del = true; twTimer = setTimeout(step, 1900); return; }
        twTimer = setTimeout(step, 70 + Math.random()*65);
      } else {
        ci--; el.textContent = w.slice(0, ci);
        if(ci <= 0){ del = false; ri++; twTimer = setTimeout(step, 380); return; }
        twTimer = setTimeout(step, 38);
      }
    }
    twTimer = setTimeout(step, 650);
  }

  let startLang = "pt";
  try{ startLang = localStorage.getItem(LANG_KEY) || "pt"; }catch(e){}
  $$(".lang button").forEach(b=> b.addEventListener("click", ()=> setLang(b.dataset.lang)));
  setLang(startLang);

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
    $$("a, button, .btn, .magnetic, image-slot").forEach(el=>{
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

  /* ---------- year ---------- */
  const yr = $(".yr"); if(yr) yr.textContent = new Date().getFullYear();
})();
