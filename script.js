(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* hero load reveal: wait for the photo so the zoom starts on a real frame */
  const heroImg = document.querySelector('.hero-bg img');
  const go = () => requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.add('ready')));
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', go, { once: true });
    setTimeout(go, 1800);
  } else go();

  /* nav */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('navlinks');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* scroll-linked pieces */
  const hero = document.querySelector('.hero');
  const bg = document.querySelector('.hero-bg');
  const fg = document.querySelector('.hero-fg');
  const name = document.querySelector('.hero-name');
  const how = document.querySelector('.how');
  const pin = document.querySelector('.how-pin');
  const imgs = [...document.querySelectorAll('.how-img')];
  const steps = [...document.querySelectorAll('.step')];
  const dock = document.querySelector('.dock');
  let current = 0, swing = 0, lastP = 0, ticking = false;

  const setStep = (i) => {
    if (i === current) return;
    current = i;
    imgs.forEach((im, k) => {
      im.classList.toggle('is-on', k === i);
      im.classList.toggle('is-past', k < i);
    });
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
  };

  const frame = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle('solid', y > vh * 0.6);
    if (dock) dock.classList.toggle('show', y > vh * 0.8);

    if (reduce.matches) return;

    /* hero: sky drifts slow, name lifts, foreground rises a little faster than the sky */
    if (y < vh * 1.2 && doc.classList.contains('ready')) {
      const p = Math.min(y / vh, 1);
      bg.style.transform = `translate3d(0, ${p * 14}vh, 0) scale(${1 + p * 0.06})`;
      name.style.transform = `translate3d(0, ${p * -6}vh, 0)`;
      name.style.opacity = String(1 - p * 0.9);
      fg.style.transform = `translate3d(0, ${p * 4}vh, 0)`;
    }

    /* how it works: hook lowers with the scroll, each quarter picks up a step */
    const r = how.getBoundingClientRect();
    const span = how.offsetHeight - vh;
    const p = Math.min(Math.max(-r.top / span, 0), 1);
    swing += ((p - lastP) * 900 - swing) * 0.25;
    swing = Math.max(-9, Math.min(9, swing));
    lastP = p;
    pin.style.setProperty('--p', p.toFixed(4));
    pin.style.setProperty('--sw', (-swing).toFixed(2));
    setStep(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)));
    if (Math.abs(swing) > 0.05) request();
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  reduce.addEventListener?.('change', () => {
    [bg, name, fg].forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
    request();
  });
  frame();

  /* a few blocks rise in once */
  const risers = document.querySelectorAll('.intro-copy, .intro-photo, .specs, .price-grid, .proof, .crews-copy, .rev-head, .areas-copy');
  risers.forEach((el) => el.classList.add('rise'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  risers.forEach((el) => io.observe(el));

  /* what fits */
  const items = {
    yes: ['Flooring', 'Carpet', 'Tile', 'Drywall', 'Plywood', 'Plaster', 'Insulation', 'Paneling', 'Siding', 'Roofing shingles', 'Trim', 'Doors', 'Windows', 'Screens', 'Cabinets', 'Sinks', 'Toilets', 'Bathtubs', 'Construction debris', 'Demolition debris', 'Packaging', 'Household junk', 'Couches and wood furniture', 'Metal furniture', 'Lawn furniture', 'Rugs', 'Textiles', 'Bikes', 'Broken toys', 'Old luggage', 'Exercise equipment', 'Grills (no propane tank)', 'Yard waste', 'Brush', 'Shrubs', 'Tree clippings', 'Leaves', 'Mulch', 'Sod'],
    fee: ['Dirt (about 2 yd per bag)', 'Concrete', 'Asphalt', 'Brick', 'Rock', 'Gravel', 'Sand', 'Mattresses', 'Box springs', 'Tree stumps'],
    no: ['Appliances', 'Refrigerators', 'Water heaters', 'Water softeners', 'Electronics', 'Tires', 'Batteries', 'Paint', 'Oil', 'Fuel', 'Propane', 'Aerosol cans', 'Chemicals', 'Hazardous waste', 'Asbestos', 'Medical waste', 'Fluorescent bulbs', 'Railroad ties', 'Liquids', 'Food waste', 'Hot materials']
  };
  const alias = {
    couch: 'Couches', sofa: 'Couches', chair: 'furniture', table: 'furniture', dresser: 'furniture', desk: 'furniture',
    tv: 'Electronics', television: 'Electronics', computer: 'Electronics', monitor: 'Electronics',
    fridge: 'Refrigerators', freezer: 'Refrigerators', washer: 'Appliances', dryer: 'Appliances', dishwasher: 'Appliances', stove: 'Appliances', oven: 'Appliances', microwave: 'Appliances',
    shingle: 'Roofing', roof: 'Roofing', tub: 'Bathtubs', bathtub: 'Bathtubs', sheetrock: 'Drywall', branches: 'Tree clippings', branch: 'Tree clippings', grass: 'Sod', weeds: 'Yard waste', bush: 'Shrubs',
    stump: 'Tree stumps', dirt: 'Dirt', soil: 'Dirt', topsoil: 'Dirt', rocks: 'Rock', pavers: 'Brick', mattress: 'Mattresses', tire: 'Tires', battery: 'Batteries',
    'water heater': 'Water heaters', 'hot water': 'Water heaters', can: 'Aerosol', propane: 'Propane', clothes: 'Textiles', fence: 'Construction debris', wood: 'Construction debris', lumber: 'Construction debris', deck: 'Construction debris'
  };
  const lists = { yes: document.getElementById('list-yes'), fee: document.getElementById('list-fee'), no: document.getElementById('list-no') };
  const all = [];
  Object.entries(items).forEach(([k, arr]) => arr.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    lists[k].appendChild(li);
    all.push({ k, t, li, lc: t.toLowerCase() });
  }));
  const cols = document.querySelector('.fit-cols');
  const q = document.getElementById('fit-q');
  const ans = document.getElementById('fit-answer');
  const verdict = {
    yes: ['y', 'Goes in', 'Toss it in the bag.'],
    fee: ['f', 'Extra fee', 'It can go in, with an added dump fee. Text a photo for the price.'],
    no: ['n', 'Keep out', 'Set it aside. Braxton can help you find where it goes.']
  };
  q.addEventListener('input', () => {
    let v = q.value.trim().toLowerCase();
    all.forEach((a) => a.li.classList.remove('hit'));
    if (v.length < 2) { cols.classList.remove('filtering'); ans.innerHTML = ''; return; }
    const key = Object.keys(alias).find((a) => v.includes(a) || (a.length > 3 && a.startsWith(v)));
    const terms = [v.replace(/s$/, '')];
    if (key) terms.push(alias[key].toLowerCase());
    const hits = all.filter((a) => terms.some((t) => a.lc.includes(t)));
    cols.classList.add('filtering');
    hits.forEach((h) => h.li.classList.add('hit'));
    if (hits.length) {
      const order = ['no', 'fee', 'yes'];
      const k = order.find((o) => hits.some((h) => h.k === o));
      const [cls, label, text] = verdict[k];
      ans.innerHTML = `<span class="tag ${cls}">${label}</span>${text}`;
    } else {
      ans.innerHTML = 'Not on the list. Text a photo to <a href="sms:+18013109023">(801) 310-9023</a> and you\'ll get a straight answer.';
    }
  });

  /* quote form: becomes a text or an email */
  const form = document.getElementById('quote-form');
  const err = document.getElementById('form-err');
  let via = 'sms';
  form.querySelectorAll('button[type=submit]').forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const nm = (f.get('name') || '').trim();
    const ad = (f.get('address') || '').trim();
    if (!nm || !ad) {
      err.textContent = 'Add your name and the delivery address or city so he can price it.';
      (nm ? form.elements.address : form.elements.name).focus();
      return;
    }
    err.textContent = '';
    const what = (f.get('what') || '').trim();
    const body = `Hi Braxton, I'd like a quote for a dumpster bag.\nName: ${nm}\nAddress: ${ad}\nBags: ${f.get('bags')}\nWhen: ${f.get('when')}` + (what ? `\nWhat's going in: ${what}` : '');
    if (via === 'email') {
      location.href = `mailto:Thegreenmanworks@gmail.com?subject=${encodeURIComponent('Dumpster quote: ' + ad)}&body=${encodeURIComponent(body)}`;
    } else {
      const sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
      location.href = `sms:+18013109023${sep}body=${encodeURIComponent(body)}`;
    }
  });
})();
