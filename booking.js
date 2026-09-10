/* ==========================================================================
   Wine & Cheese Paris - couche de reservation
   --------------------------------------------------------------------------
   Le Wine & Cheese Walk (widget TicketingHub) a ete retire du site le
   10 septembre 2026. La seule offre restante, la degustation privee, est
   sur devis via contact.html : plus de widget, plus d'ecran de choix entre
   deux offres.

   Dans le HTML, un CTA generique porte l'attribut data-book="choose"
   (bouton "Book Now" du header, sans href) : le clic envoie vers
   contact.html, ou fait defiler jusqu'au formulaire si on y est deja.
   Un CTA deja specifique (lien <a href="contact.html?enquiry=...">) n'a
   besoin d'aucun JS, son href fait le travail seul.
   ========================================================================== */

(function () {
  'use strict';

  var CONTACT_URL = 'contact.html';

  function track(name, props) {
    if (window.plausible) window.plausible(name, props ? { props: props } : undefined);
  }

  function goToBooking(product) {
    track('Booking CTA clicked', { product: product || 'unknown' });
    var form = document.getElementById('contactForm');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    window.location.href = CONTACT_URL;
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-book]') : null;
    if (!el) return;

    /* Un lien deja cible (ex: data-book="private") laisse son href agir. */
    if (el.tagName === 'A' && el.getAttribute('href')) {
      track('Booking CTA clicked', { product: el.getAttribute('data-book') });
      return;
    }

    e.preventDefault();
    goToBooking(el.getAttribute('data-book'));
  }, true);

  /* ---------------------------------------------------------------------
     FORMULAIRE DE CONTACT PRE-REMPLI
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
     DEEP LINK
     /?book=choose (ou toute autre valeur historique) envoie vers
     contact.html, pour ne pas casser d'anciens liens partages.
     --------------------------------------------------------------------- */

  var book = /[?&]book=([a-z-]+)/i.exec(window.location.search);
  if (book) {
    window.addEventListener('load', function () {
      window.location.href = CONTACT_URL;
    });
  }
})();
