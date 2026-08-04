/* ==========================================================================
   Wine & Cheese Paris - couche de reservation
   Provider : TicketingHub (widget popover officiel)
   --------------------------------------------------------------------------
   TOUT SE CONFIGURE ICI, dans les blocs WIDGETS et OFFERS ci-dessous.

   Dans le HTML, un CTA de reservation ne porte qu'un attribut :
       data-book="choose"    -> ouvre l'ecran de choix entre les 2 offres
       data-book="walk"      -> ouvre directement le widget TicketingHub
       data-book="private"   -> laisse le lien faire son travail (formulaire)

   IMPORTANT : ce fichier doit etre charge SANS defer, juste AVANT le script
   TicketingHub, en bas du <body> :
       <script src="booking.js"></script>
       <script src="https://widget.ticketinghub.com/embedding/latest.js"></script>
   TicketingHub ne relie ses popovers qu'une seule fois, au chargement.
   Si les attributs sont poses apres, les boutons restent inertes.

   Tant qu'un ID de widget est vide, le bouton garde son comportement natif
   (un lien suit son href, un bouton ne fait rien) : le site ne casse jamais.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. WIDGETS TICKETINGHUB
     Dashboard > Widgets > (le widget) > Installation Instructions.
     L'ID est le "widgetId" du bloc de code.
     --------------------------------------------------------------------- */

  var WIDGETS = {
    walk: '77d51d97-38a5-40fc-b28f-ddc23bd0e8d0',   // widget "WIne and Cheese Walk"
    'private': ''                                    // Private Tasting : sur devis, pas de widget
  };

  /* ---------------------------------------------------------------------
     2. LES DEUX OFFRES DE L'ECRAN DE CHOIX
     Textes bilingues, memes chiffres que les cartes de la page d'accueil.
     --------------------------------------------------------------------- */

  var PRIVATE_URL = 'contact.html?enquiry=private-couples';

  var OFFERS = [
    {
      key: 'walk',
      image: 'images/card-wine.jpg',
      tag: { en: 'Bestseller', fr: 'Le plus demandé' },
      name: { en: 'Wine &amp; Cheese Walk', fr: 'Balade Vin &amp; Fromage' },
      desc: {
        en: 'Five Montmartre artisans, five wine and cheese pairings, guided in English.',
        fr: 'Cinq artisans de Montmartre, cinq accords vin-fromage, en anglais.'
      },
      meta: { en: '2h30 · 2–8 guests · From €75 / person', fr: '2h30 · 2 à 8 pers. · À partir de 75 € / pers.' },
      cta: { en: 'Check dates &amp; book', fr: 'Voir les dates et réserver' },
      note: { en: 'Instant confirmation', fr: 'Confirmation immédiate' }
    },
    {
      key: 'private',
      image: 'images/card-rooftop.jpg',
      tag: { en: 'Private', fr: 'Privé' },
      name: { en: 'Private Tasting', fr: 'Dégustation Privée' },
      desc: {
        en: 'A tasting built around your occasion, in a Montmartre cellar or on a rooftop.',
        fr: 'Une dégustation construite autour de votre occasion, en cave ou en rooftop.'
      },
      meta: { en: '2h · 2–12 guests · From €120 / person', fr: '2h · 2 à 12 pers. · À partir de 120 € / pers.' },
      cta: { en: 'Request a proposal', fr: 'Demander une proposition' },
      note: { en: 'Thomas replies within 24h', fr: 'Réponse de Thomas sous 24h' }
    }
  ];

  function lang() { return document.documentElement.lang === 'fr' ? 'fr' : 'en'; }
  function t(o) { return o[lang()] || o.en; }

  /* ---------------------------------------------------------------------
     3. STYLES (auto-injectes, rien a ajouter dans shared.css)
     --------------------------------------------------------------------- */

  var CSS = [
    '.wc-choose{position:fixed;inset:0;z-index:9000;display:none;align-items:center;justify-content:center;',
    'padding:24px;background:rgba(26,18,14,.74);opacity:0;transition:opacity .22s ease;}',
    '.wc-choose.is-open{display:flex;}',
    '.wc-choose.is-visible{opacity:1;}',
    '.wc-choose-box{position:relative;width:100%;max-width:840px;max-height:92vh;overflow-y:auto;',
    'background:#FAF6F1;border-radius:16px;padding:40px 32px 32px;box-shadow:0 24px 64px rgba(0,0,0,.36);',
    'transform:translateY(14px) scale(.985);transition:transform .22s ease;}',
    '.wc-choose.is-visible .wc-choose-box{transform:none;}',
    '.wc-choose-close{position:absolute;top:14px;right:14px;width:40px;height:40px;border:none;border-radius:50%;',
    'background:rgba(114,47,55,.08);color:#4A1A20;font-size:22px;line-height:1;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;transition:background 220ms ease;}',
    '.wc-choose-close:hover{background:rgba(114,47,55,.16);}',
    '.wc-choose-eyebrow{font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:11px;font-weight:600;',
    'letter-spacing:.18em;text-transform:uppercase;color:#7A6340;text-align:center;margin-bottom:8px;}',
    '.wc-choose-title{font-family:"Playfair Display",Georgia,serif;font-size:clamp(24px,3.4vw,32px);font-weight:500;',
    'color:#4A1A20;text-align:center;line-height:1.2;margin-bottom:6px;}',
    '.wc-choose-sub{font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:15px;color:#4A4A4A;',
    'text-align:center;margin-bottom:28px;}',
    '.wc-choose-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}',
    '.wc-offer{display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;',
    'box-shadow:0 4px 24px rgba(44,28,20,.10);transition:transform 220ms ease,box-shadow 220ms ease;}',
    '.wc-offer:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(44,28,20,.18);}',
    '.wc-offer-img{position:relative;aspect-ratio:16/9;overflow:hidden;background:#F5ECD7;}',
    '.wc-offer-img img{width:100%;height:100%;object-fit:cover;}',
    '.wc-offer-tag{position:absolute;top:12px;left:12px;background:rgba(250,246,241,.94);color:#7A6340;',
    'font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:10px;font-weight:600;letter-spacing:.12em;',
    'text-transform:uppercase;padding:5px 10px;border-radius:4px;}',
    '.wc-offer-body{display:flex;flex-direction:column;flex:1;padding:20px;}',
    '.wc-offer-name{font-family:"Playfair Display",Georgia,serif;font-size:21px;font-weight:600;color:#4A1A20;margin-bottom:8px;}',
    '.wc-offer-desc{font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:14px;color:#4A4A4A;line-height:1.55;margin-bottom:12px;}',
    '.wc-offer-meta{font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:13px;font-weight:500;color:#7A6340;margin-bottom:18px;}',
    '.wc-offer-cta{display:block;width:100%;margin-top:auto;text-align:center;text-decoration:none;cursor:pointer;',
    'font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:15px;font-weight:600;padding:14px 16px;',
    'border-radius:4px;border:none;min-height:48px;transition:background 220ms ease,color 220ms ease;}',
    '.wc-offer-cta.is-primary{background:#C9A96E;color:#4A1A20;}',
    '.wc-offer-cta.is-primary:hover{background:#b8924d;}',
    '.wc-offer-cta.is-secondary{background:transparent;color:#4A1A20;border:1px solid rgba(74,26,32,.35);}',
    '.wc-offer-cta.is-secondary:hover{background:#4A1A20;color:#FAF6F1;}',
    '.wc-offer-note{font-family:"DM Sans","Helvetica Neue",sans-serif;font-size:12px;color:#A69586;text-align:center;margin-top:10px;}',
    'body.wc-choose-locked{overflow:hidden;}',
    '@media (max-width:720px){.wc-choose{padding:0;}',
    '.wc-choose-box{max-width:none;height:100%;max-height:none;border-radius:0;padding:56px 20px 24px;}',
    '.wc-choose-grid{grid-template-columns:1fr;gap:16px;}',
    '.wc-offer-img{aspect-ratio:21/9;}}'
  ].join('');

  var style = document.createElement('style');
  style.id = 'wc-choose-styles';
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---------------------------------------------------------------------
     4. CONSTRUCTION DE L'ECRAN DE CHOIX
     Il est monte des maintenant, avant le script TicketingHub, pour que
     celui-ci relie la carte "walk" au meme titre que les autres CTA.
     --------------------------------------------------------------------- */

  var HEAD = {
    eyebrow: { en: 'Two ways to taste Paris', fr: 'Deux façons de goûter Paris' },
    title: { en: 'Which experience are you after?', fr: 'Quelle expérience vous tente ?' },
    sub: {
      en: 'Join a small group walk, or have a tasting built around your occasion.',
      fr: 'Rejoignez une balade en petit groupe, ou faites construire une dégustation sur mesure.'
    }
  };

  function offerHtml(o) {
    var isWalk = o.key === 'walk';
    var ctaOpen = isWalk
      ? '<button type="button" class="wc-offer-cta is-primary" data-book="walk"'
      : '<a class="wc-offer-cta is-secondary" href="' + PRIVATE_URL + '" data-book="private"';
    var ctaClose = isWalk ? '</button>' : '</a>';
    return '<article class="wc-offer">'
      + '<div class="wc-offer-img"><img src="' + o.image + '" alt="" loading="lazy">'
      + '<span class="wc-offer-tag" data-en="' + o.tag.en + '" data-fr="' + o.tag.fr + '">' + t(o.tag) + '</span></div>'
      + '<div class="wc-offer-body">'
      + '<h3 class="wc-offer-name" data-en="' + o.name.en + '" data-fr="' + o.name.fr + '">' + t(o.name) + '</h3>'
      + '<p class="wc-offer-desc" data-en="' + o.desc.en + '" data-fr="' + o.desc.fr + '">' + t(o.desc) + '</p>'
      + '<p class="wc-offer-meta" data-en="' + o.meta.en + '" data-fr="' + o.meta.fr + '">' + t(o.meta) + '</p>'
      + ctaOpen + ' data-en="' + o.cta.en + '" data-fr="' + o.cta.fr + '">' + t(o.cta) + ctaClose
      + '<p class="wc-offer-note" data-en="' + o.note.en + '" data-fr="' + o.note.fr + '">' + t(o.note) + '</p>'
      + '</div></article>';
  }

  var chooser = document.createElement('div');
  chooser.className = 'wc-choose';
  chooser.setAttribute('role', 'dialog');
  chooser.setAttribute('aria-modal', 'true');
  chooser.setAttribute('aria-label', t(HEAD.title));
  chooser.innerHTML =
    '<div class="wc-choose-box">'
    + '<button type="button" class="wc-choose-close" aria-label="Close">&times;</button>'
    + '<p class="wc-choose-eyebrow" data-en="' + HEAD.eyebrow.en + '" data-fr="' + HEAD.eyebrow.fr + '">' + t(HEAD.eyebrow) + '</p>'
    + '<h2 class="wc-choose-title" data-en="' + HEAD.title.en + '" data-fr="' + HEAD.title.fr + '">' + t(HEAD.title) + '</h2>'
    + '<p class="wc-choose-sub" data-en="' + HEAD.sub.en + '" data-fr="' + HEAD.sub.fr + '">' + t(HEAD.sub) + '</p>'
    + '<div class="wc-choose-grid">' + OFFERS.map(offerHtml).join('') + '</div>'
    + '</div>';
  document.body.appendChild(chooser);

  /* ---------------------------------------------------------------------
     5. BRANCHEMENT TICKETINGHUB
     Doit passer apres la construction de l'ecran de choix, et avant que
     le script TicketingHub ne s'execute.
     --------------------------------------------------------------------- */

  Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (el) {
    var id = WIDGETS[el.getAttribute('data-book')];
    if (!id) return;
    el.setAttribute('data-th-popover', '');
    el.setAttribute('data-th-config', JSON.stringify({ widgetId: id }));
  });

  /* ---------------------------------------------------------------------
     6. OUVERTURE ET FERMETURE
     --------------------------------------------------------------------- */

  var lastFocus = null;

  function openChooser() {
    lastFocus = document.activeElement;
    chooser.classList.add('is-open');
    document.body.classList.add('wc-choose-locked');
    requestAnimationFrame(function () { chooser.classList.add('is-visible'); });
    var first = chooser.querySelector('.wc-offer-cta');
    if (first) first.focus();
    document.addEventListener('keydown', onKey);
    track('Booking choice opened');
  }

  function closeChooser() {
    if (!chooser.classList.contains('is-open')) return;
    document.removeEventListener('keydown', onKey);
    chooser.classList.remove('is-visible');
    setTimeout(function () {
      chooser.classList.remove('is-open');
      document.body.classList.remove('wc-choose-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 220);
  }

  function onKey(e) {
    if (e.key === 'Escape') closeChooser();
  }

  chooser.querySelector('.wc-choose-close').addEventListener('click', closeChooser);
  chooser.addEventListener('mousedown', function (e) { if (e.target === chooser) closeChooser(); });

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-book]') : null;
    if (!el) return;
    var key = el.getAttribute('data-book');

    if (key === 'choose') {
      e.preventDefault();
      openChooser();
      return;
    }

    /* Un choix a ete fait dans l'ecran : on s'efface pour laisser la place
       au widget TicketingHub, qui vient de s'ouvrir par-dessus. */
    if (chooser.contains(el)) {
      track('Booking choice picked', { product: key });
      closeChooser();
      return;
    }

    track('Booking widget opened', { product: key });
  }, true);

  function track(name, props) {
    if (window.plausible) window.plausible(name, props ? { props: props } : undefined);
  }

  /* ---------------------------------------------------------------------
     7. FORMULAIRE DE CONTACT PRE-REMPLI
     contact.html?enquiry=private-couples arrive avec le motif deja choisi.
     --------------------------------------------------------------------- */

  var enquiry = /[?&]enquiry=([a-z-]+)/i.exec(window.location.search);
  if (enquiry) {
    window.addEventListener('DOMContentLoaded', function () {
      var select = document.getElementById('enquiryType');
      if (!select) return;
      var value = enquiry[1];
      var exists = Array.prototype.some.call(select.options, function (o) { return o.value === value; });
      if (!exists) return;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      var form = document.getElementById('contactForm');
      if (form) setTimeout(function () { form.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
    });
  }

  /* ---------------------------------------------------------------------
     8. DEEP LINKS
     /?book=choose  -> ouvre l'ecran de choix
     /?book=walk    -> ouvre directement le widget TicketingHub
     --------------------------------------------------------------------- */

  var book = /[?&]book=([a-z-]+)/i.exec(window.location.search);
  if (book) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        if (book[1] === 'choose') { openChooser(); return; }
        if (!WIDGETS[book[1]]) return;
        var target = document.querySelector('[data-book="' + book[1] + '"][data-th-popover]');
        if (target) target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }, 600);
    });
  }

  window.WCBooking = { open: openChooser, close: closeChooser };
})();
