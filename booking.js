/* ==========================================================================
   Wine & Cheese Paris - couche de reservation
   Provider : TicketingHub (widget popover officiel)
   --------------------------------------------------------------------------
   TOUT SE CONFIGURE ICI, dans le bloc WIDGETS ci-dessous.
   Aucun fichier HTML n'a besoin d'etre modifie quand un ID change,
   ni le jour ou l'on change de provider.

   Dans le HTML, un bouton de reservation s'ecrit simplement :
       <button class="btn-book-nav" data-book="walk">Book Now</button>
       <a href="contact.html" class="btn-tour" data-book="private">Request a quote</a>

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
     1. CONFIGURATION
     ---------------------------------------------------------------------
     Ou trouver un ID :
     TicketingHub > Widgets > (le widget) > Installation Instructions
     L'ID est le "widgetId" du bloc de code, et c'est aussi la fin de l'URL
     de la page du widget dans le dashboard.
     --------------------------------------------------------------------- */

  var WIDGETS = {
    walk: '77d51d97-38a5-40fc-b28f-ddc23bd0e8d0',   // widget "WIne and Cheese Walk"
    'private': ''                                    // <-- widget "Private Tasting", a creer
  };

  /* ---------------------------------------------------------------------
     2. BRANCHEMENT DES BOUTONS
     On pose sur chaque [data-book] les attributs que TicketingHub attend.
     --------------------------------------------------------------------- */

  var triggers = document.querySelectorAll('[data-book]');

  Array.prototype.forEach.call(triggers, function (el) {
    var id = WIDGETS[el.getAttribute('data-book')];
    if (!id) return;                                 // non configure : on ne touche a rien
    el.setAttribute('data-th-popover', '');
    el.setAttribute('data-th-config', JSON.stringify({ widgetId: id }));
  });

  /* ---------------------------------------------------------------------
     3. SUIVI PLAUSIBLE
     Un evenement par ouverture de widget, avec le produit en propriete.
     --------------------------------------------------------------------- */

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-th-popover][data-book]') : null;
    if (!el) return;
    if (window.plausible) {
      window.plausible('Booking widget opened', { props: { product: el.getAttribute('data-book') } });
    }
  }, true);

  /* ---------------------------------------------------------------------
     4. DEEP LINK  /?book=walk
     Utile pour la fiche Google Business, un QR code sur un flyer,
     ou un lien de relance par email.
     --------------------------------------------------------------------- */

  var match = /[?&]book=([a-z-]+)/i.exec(window.location.search);
  if (match && WIDGETS[match[1]]) {
    window.addEventListener('load', function () {
      var target = document.querySelector('[data-book="' + match[1] + '"][data-th-popover]');
      if (!target) return;
      setTimeout(function () {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }, 600);
    });
  }
})();
