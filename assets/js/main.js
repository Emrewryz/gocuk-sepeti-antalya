/* Göçük Sepeti Antalya – etkileşimler */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header gölgesi + aktif menü */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const links = $$('.nav a[href^="#"]');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const t = $(a.getAttribute('href')); if (t) spy.observe(t); });

  /* Mobil menü */
  const burger = $('#burger'), nav = $('#nav');
  const setMenu = open => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç'); };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Kaydırınca belirme */
  const rv = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => rv.observe(el));

  /* Sayaçlar */
  const fmt = (v, d) => d ? v.toFixed(d).replace('.', ',') : Math.round(v).toLocaleString('tr-TR');
  const cnt = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, d = +(el.dataset.dec || 0);
    cnt.unobserve(el);
    if (reduce) { el.textContent = fmt(to, d); return; }
    const t0 = performance.now(), dur = 1800;
    const tick = t => { const p = Math.min((t - t0) / dur, 1), k = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * k, d); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cnt.observe(el));

  /* Dönen kelime */
  const rot = $$('#rot span'); let ri = 0;
  if (rot.length) {
    rot[0].classList.add('on');
    if (!reduce) setInterval(() => {
      const cur = rot[ri]; cur.classList.remove('on'); cur.classList.add('out');
      setTimeout(() => cur.classList.remove('out'), 650);
      ri = (ri + 1) % rot.length; rot[ri].classList.add('on');
    }, 2400);
  }

  /* Hero videosu oynamazsa fotoğrafa düş */
  const hv = $('.hero__video');
  if (hv) {
    const fallback = () => { $('.hero__photo').style.opacity = 1; hv.style.display = 'none'; };
    hv.addEventListener('error', fallback, true);
    const p = hv.play(); if (p) p.catch(fallback);
  }

  /* Önce / Sonra kaydırıcı */
  $$('[data-ba]').forEach(ba => {
    const r = $('input', ba);
    const set = v => ba.style.setProperty('--p', v + '%');
    r.addEventListener('input', () => { ba.classList.remove('hint'); set(r.value); });
    // görünür olunca kısa bir "kaydır" ipucu animasyonu
    if (!reduce) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; io.disconnect();
        ba.classList.add('hint');
        const seq = [22, 78, 50]; seq.forEach((v, i) => setTimeout(() => { if (ba.classList.contains('hint')) { set(v); r.value = v; } }, 400 + i * 950));
        setTimeout(() => ba.classList.remove('hint'), 400 + seq.length * 950);
      }), { threshold: .6 });
      io.observe(ba);
    }
  });

  /* Kartlarda fareyi izleyen ışık */
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const b = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px');
  }));

  /* Galeri lightbox */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  const closeLb = () => { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; };
  $$('.gal').forEach(g => g.addEventListener('click', () => {
    lbImg.src = g.dataset.full; lbImg.alt = $('img', g).alt; lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lightbox__x', lb).focus();
  }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* Videolar: görünürken oynat, dokununca ses aç */
  const reels = $$('.reel');
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = $('video', e.target);
    if (e.isIntersecting) {
      if (!v.src) v.src = v.dataset.lazySrc;
      if (!reduce) v.play().catch(() => {});
    } else { v.pause(); }
  }), { threshold: .45 });
  reels.forEach(r => {
    const v = $('video', r);
    v.src = v.dataset.lazySrc + '#t=0.5'; // ilk kareyi göster
    vio.observe(r);
    r.addEventListener('click', () => {
      const on = !r.classList.contains('sound');
      reels.forEach(o => { o.classList.remove('sound'); $('video', o).muted = true; $('use', o).setAttribute('href', '#i-mute'); });
      if (on) { r.classList.add('sound'); v.muted = false; v.currentTime = 0; v.play().catch(() => {}); $('use', r).setAttribute('href', '#i-sound'); }
    });
  });

  /* Google yorumları */
  const reviews = [
    ['Didem Y.', '2 ay önce', 'Aracımda oluşan göçük için hizmet aldım ve sonuçtan gerçekten çok memnun kaldım. İşçilik son derece temiz, titiz ve profesyoneldi. Göçükten eser kalmadı, aracım…'],
    ['Con', '2 hafta önce', 'Öncesindeki hatalı işçiliğe rağmen, hasarın konumunun çok talihsiz bir yere denk gelip önceki götürdüğüm yerlerde hem abartı fiyatlar çekilip hem de boyanacak…'],
    ['Murat E.', '1 hafta önce', 'Titiz birisi olduğum için arabamdaki sürtmeden kaynaklı göçük gözüme takılıyordu. İnternetten tesadüf bulduğum yere tedirgin olarak gitmiştim, tanışınca samimi…'],
    ['Burak G.', '2 hafta önce', 'İşçilik ve sonuç gerçekten harika! Aracımı ilk günkü gibi teslim aldım. İşini özenle yapan, güler yüzlü ve güvenilir bir işletme. Gönül rahatlığıyla tavsiye ederim, emeklerine sağlık!'],
    ['Cumhur Ö.', '1 ay önce', 'Müşteri karşılama çok güzeldi. Müşteriyi iyi dinleyip sorunların ne olduğunu iyi tespit ediyorlar ve müşterinin istediği doğrultuda maksimum faydayı sağlamaya…'],
    ['Mevlüt O.', '3 ay önce', 'Denizli’den randevu alarak geldiğim Göçük Sepeti Antalya bayisine çok teşekkür ederim. Sol arka kapıda demir bariyere çarpmamdan kaynaklı ağır bir hasar oluştu…'],
    ['Erkan A.', '4 ay önce', 'Aracım 2025 model BYD Seal U DM-i. Aracın yan kapılarında göçükler vardı. Arkadaşlar kapıyı sökmeden göçükleri neredeyse hiç görünmeyecek şekilde düzelttiler. Göçük problemi olan kişilere rahatlıkla tavsiye ederim.'],
    ['Aslan M.', '2 ay önce', 'Arkadaşımın referansı ile 2024 model Honda City aracımın hasarlarını yaptırdım. Aynasını tamir ettirdim. Çok memnun kaldım. Herkese tavsiye ediyorum.'],
    ['Kubilay O.', '2 ay önce', 'Çoğu ustanın değişim dediği hasarı özenle boyasız göçük tamiratı ile kısa bir sürede tamamladılar. Ellerine emeklerine sağlık.'],
    ['Murat', '3 ay önce', 'Aracımızda boyasız göçük onarımı yaptırdık. Açıkçası nasıl olacağını bilmiyorduk. Ufak da olsa endişemiz vardı. Ama İsmail ve Ergül ustalar işin hakkını vermişler. Çok çok memnun kaldım. Herkese şiddetle tavsiye ederim.'],
    ['Musa Ekrem A.', '5 ay önce', 'Aracımın sol iki kapısında da göçük vardı, arkadaşlar kapıyı sökmeden göçüğü düzeltmeyi başardılar. Teşekkürler.'],
    ['Murat Y.', '3 ay önce', '13 Temmuz 2026 tarihinde aracımı boyasız göçük onarımı için bıraktım. 16 Temmuz 2026 tarihinde de aracımı aldım, çok memnun kaldım…'],
    ['Ahmet Ö.', '4 ay önce', 'Sol arka çamurluktaki göçük düzeltme ve pasta cila işlemleri için gittim. İşçilikleri gerçekten çok başarılı ve sonuçtan çok memnun kaldım. Çok güler yüzlü…'],
    ['İsmail P.', '2 ay önce', 'Yaptığım ufak bir kazadan dolayı ufak tefek hasarım için kaskomu bozmak istemedim. Uygun fiyata beklentimin üzerinde işçilik ile %99 düzeltme ile çok memnun kaldım.'],
    ['Mehmet Ayberk Ç.', '6 ay önce', 'Vosvos benim için sadece araba değil, o yüzden teslim ederken biraz tedirgindim. Ama sonuç gerçekten beklentimin üstünde oldu 🔥 Göçükler tamamen kayboldu, boya orijinalliği korunmuş, işçilik çok temiz. Eline emeğine sağlık, kesinlikle doğru adres 👌']
  ];
  const colors = ['#2fd27a', '#ffc83d', '#7cc4ff', '#ff9f6b', '#c39bff', '#5ee6d0'];
  const gSvg = '<svg class="rev__g" viewBox="0 0 48 48" aria-label="Google"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const card = ([n, t, txt], i) => `<article class="rev"><div class="rev__top"><span class="rev__av" style="background:${colors[i % colors.length]}">${esc(n[0])}</span><div><div class="rev__name">${esc(n)}</div><div class="rev__meta">${esc(t)}</div></div>${gSvg}</div><span class="stars">★★★★★</span><p>${esc(txt)}</p></article>`;
  const track = $('#revTrack');
  if (track) {
    const html = reviews.map(card).join('');
    track.innerHTML = html + html.replace(/<article class="rev"/g, '<article class="rev" aria-hidden="true"');
  }

  /* Şu an açık mı? (Türkiye saati) */
  const st = $('#openStatus');
  if (st) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    const open = d !== 0 && m >= 480 && m < 1140;
    $(`#hours tr[data-d="${d}"]`)?.classList.add('today');
    st.classList.toggle('closed', !open);
    $('span:last-child', st).textContent = open
      ? `Şu an açık · 19:00'a kadar`
      : (d === 6 && m >= 1140) || d === 0 ? 'Şu an kapalı · Pazartesi 08:00\'de açılır' : 'Şu an kapalı · 08:00\'de açılır';
  }

  /* Tema geçişi */
  const root = document.documentElement, tBtn = $('#themeBtn'), metaTc = $('meta[name="theme-color"]');
  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    tBtn.setAttribute('aria-label', light ? 'Karanlık temaya geç' : 'Açık temaya geç');
    metaTc.content = light ? '#f5f7f6' : '#0b0d10';
  };
  syncTheme();
  tBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('tema', root.dataset.theme); } catch (e) {}
    syncTheme();
  });
  // Kullanıcı elle seçmediyse cihaz ayarını takip et
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    let saved = null; try { saved = localStorage.getItem('tema'); } catch (_) {}
    if (!saved) { root.dataset.theme = e.matches ? 'light' : 'dark'; syncTheme(); }
  });

  $('#yr').textContent = new Date().getFullYear();
})();
