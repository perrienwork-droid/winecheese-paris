/* ==========================================================================
   Wine & Cheese Paris - couche analytics
   Provider : Plausible (sans cookie)
   --------------------------------------------------------------------------
   A charger sur TOUTES les pages, apres le stub Plausible et avant (ou apres,
   l'ordre n'importe pas grace au stub) le script officiel plausible.io :

       <script>
       window.plausible = window.plausible || function() {
         (window.plausible.q = window.plausible.q || []).push(arguments) }
       </script>
       <script defer src="analytics.js"></script>
       <script defer data-domain="winecheese.paris" src="https://plausible.io/js/script.js"></script>

   Regles :
   - track() ne leve jamais d'exception, quoi qu'il arrive.
   - Aucun evenement n'est envoye sur localhost / 127.0.0.1.
   - Aucune donnee personnelle n'est envoyee (pas d'email, nom, telephone,
     message ou date), uniquement des categories (type de demande, taille de
     groupe, page, motif d'echec, nom de champ).
   - Les props personnalisees necessitent le plan Business de Plausible, mais
     les NOMS d'evenements seuls suffisent a reconstruire l'entonnoir en
     comparant les compteurs sur le plan gratuit.
   ========================================================================== */

(function () {
  'use strict';

  var isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  var firedOnce = Object.create(null);

  function track(name, props, opts) {
    try {
      if (isLocalHost) return;
      if (opts && opts.once) {
        if (firedOnce[name]) return;
        firedOnce[name] = true;
      }
      if (typeof window.plausible !== 'function') return;
      if (props) {
        window.plausible(name, { props: props });
      } else {
        window.plausible(name);
      }
    } catch (e) {
      /* le tracking ne doit jamais casser le parcours utilisateur */
    }
  }

  window.WCAnalytics = { track: track };

  /* ------------------------------------------------------------------
     Intentions site-wide : CTA, liens sortants, FAQ.
     Delegation sur document : fonctionne quel que soit l'ordre de
     chargement, et couvre les elements ajoutes dynamiquement.
     ------------------------------------------------------------------ */

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var link = target.closest('a[href]');
    if (link) {
      var href = link.getAttribute('href') || '';

      if (href.indexOf('mailto:') === 0) {
        track('Outbound: Mailto');
      } else if (href.indexOf('tel:') === 0) {
        track('Outbound: Phone');
      } else if (/^https?:\/\//i.test(href) && /ticketinghub\.com|bokun\.io|fareharbor\.com|getyourguide\.com|viator\.com/i.test(href)) {
        track('Outbound: Booking');
      } else if (href.indexOf('contact.html') !== -1) {
        track('CTA: Contact', { page: window.location.pathname });
      }
    }

    var bookEl = target.closest('[data-book="walk"]');
    if (bookEl) {
      track('CTA: Book Now', { page: window.location.pathname });
    }

    var faqEl = target.closest('.faq-question');
    if (faqEl) {
      var label = faqEl.querySelector('[data-en]');
      var question = (label ? label.getAttribute('data-en') : faqEl.textContent) || '';
      track('FAQ: Opened', { question: question.trim().slice(0, 80) });
    }
  }, true);

  /* ------------------------------------------------------------------
     Estimateur de prix (a venir). Decommenter les appels au fur et a
     mesure de l'implementation, aucun autre changement necessaire.
     ------------------------------------------------------------------
  // window.WCAnalytics.track('Estimator: Opened');
  // window.WCAnalytics.track('Estimator: Group Size Changed', { size: value });
  // window.WCAnalytics.track('Estimator: Venue Changed', { venue: value });
  // window.WCAnalytics.track('Estimator: Price Shown', { bracket: value });
  // window.WCAnalytics.track('Estimator: CTA Clicked');
  ------------------------------------------------------------------ */
})();
