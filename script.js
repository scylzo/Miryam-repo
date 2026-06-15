(function () {
  // Initialisation de la carte Leaflet
  function initMap() {
    const mapElement = document.getElementById("map");
    const fallback = document.getElementById("map-fallback");

    if (!mapElement) {
      return;
    }

    if (typeof L === "undefined") {
      if (fallback) fallback.style.display = "block";
      return;
    }

    // Évite d'initialiser deux fois la même carte si le script est relancé.
    if (mapElement._leaflet_id) {
      return;
    }

    // Coordonnées du quartier Saint-Clément à Montpellier
    const centreSaintClement = [43.615, 3.845];

    const map = L.map(mapElement, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const cercle = L.circle(centreSaintClement, {
      radius: 30000, // Cercle de 30 km d'intervention
      color: "#4f6f63",
      fillColor: "#aab8b1",
      fillOpacity: 0.30,
      weight: 3,
    }).addTo(map);

    // Cadrage automatique : le cercle de 30 km est visible dès l'ouverture.
    map.fitBounds(cercle.getBounds(), { padding: [24, 24] });

    // Corrige les cartes blanches quand Leaflet calcule la taille trop tôt.
    setTimeout(function () {
      map.invalidateSize();
      map.fitBounds(cercle.getBounds(), { padding: [24, 24] });
    }, 250);

    setTimeout(function () {
      map.invalidateSize();
      map.fitBounds(cercle.getBounds(), { padding: [24, 24] });
    }, 1000);
  }

  // Initialisation du formulaire de contact et vérifications RGPD
  function initForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      // Si l'action est '#' ou vide, on simule l'envoi client pour la validation visuelle
      const actionAttr = form.getAttribute('action');
      if (actionAttr === '#' || !actionAttr) {
        e.preventDefault();

        // Récupérer le bouton d'envoi
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Envoi de votre demande en cours...";
        submitBtn.disabled = true;

        // Simulation d'envoi
        setTimeout(function () {
          submitBtn.textContent = "Demande envoyée avec succès !";
          submitBtn.style.backgroundColor = "var(--vert)";
          submitBtn.style.color = "white";

          form.reset();

          // Restauration du bouton après 4 secondes
          setTimeout(function () {
            submitBtn.textContent = originalText;
            submitBtn.style.backgroundColor = "";
            submitBtn.style.color = "";
            submitBtn.disabled = false;
          }, 4000);
        }, 1500);
      }
    });
  }

  // Gestion du menu mobile hamburger
  function initMobileMenu() {
    console.log("initMobileMenu: Initialisation du menu mobile");
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');

    if (!toggleBtn || !navMenu) {
      console.warn("initMobileMenu: Bouton toggle ou nav non trouvé", { toggleBtn, navMenu });
      return;
    }

    function toggleMenu() {
      console.log("toggleMenu: Clic détecté sur le bouton hamburger");
      const isOpen = toggleBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      console.log("toggleMenu: Classes actives basculées. État ouvert =", isOpen);
      
      // Empêche le défilement de l'arrière-plan du site lorsque le menu est ouvert
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    toggleBtn.addEventListener('click', toggleMenu);

    // Ferme le menu lors du clic sur un lien (car ce sont des liens vers des ancres de la page)
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navMenu.classList.contains('active')) {
          toggleMenu();
        }
      });
    });
  }

  // Chargement des scripts au chargement du DOM de manière sécurisée
  function safeInit() {
    console.log("safeInit: Lancement des initialisations");
    try {
      initMap();
    } catch (e) {
      console.error("Erreur lors de l'initialisation de la carte Leaflet:", e);
    }
    
    try {
      initForm();
    } catch (e) {
      console.error("Erreur lors de l'initialisation du formulaire:", e);
    }
    
    try {
      initMobileMenu();
    } catch (e) {
      console.error("Erreur lors de l'initialisation du menu mobile:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
})();
