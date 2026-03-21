// Shared nav behaviour — include on every page
(function() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // Scroll handler
  window.addEventListener('scroll', function() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Language toggle (simple version for inner pages)
  const toggle = document.getElementById('langToggle');
  if (!toggle) return;
  let lang = 'en';

  toggle.addEventListener('click', function() {
    lang = lang === 'en' ? 'fr' : 'en';
    this.textContent = lang === 'en' ? 'FR' : 'EN';
    this.setAttribute('aria-label', lang === 'en' ? 'Switch to French' : 'Passer en anglais');
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach(function(el) {
      var t = lang === 'en' ? el.dataset.en : el.dataset.fr;
      if (t) el.innerHTML = t;
    });
  });

  // Fade-in observer
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.fade-in').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
})();
