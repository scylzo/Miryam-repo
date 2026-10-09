(function () {
  // Initialisation du formulaire de contact et vérifications RGPD
  function initForm() {
    console.log("initForm: Initialisation du formulaire de contact");
    const form = document.getElementById('contact-form') || document.querySelector('form');
    if (!form) {
      console.warn("initForm: Formulaire non trouvé");
      return;
    }

    const feedback = document.getElementById('form-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
      console.log("submit: Clic d'envoi détecté sur le formulaire");
      const actionAttr = form.getAttribute('action');
      
      // Si aucune action configurée, ne rien faire de spécial
      if (!actionAttr || actionAttr === '#') {
        console.warn("submit: Action non configurée ou #");
        return;
      }

      e.preventDefault();

      // Vérification validation native HTML5
      if (!form.checkValidity()) {
        console.log("submit: Formulaire non valide selon les règles HTML5");
        form.reportValidity();
        return;
      }

      // Protection antispam Honeypot (si rempli par un robot, on bloque silencieusement)
      const honeypot = form.querySelector('input[name="email_address_check"]');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam détecté.');
        return;
      }

      const originalText = submitBtn ? submitBtn.textContent : "Envoyer ma demande";
      if (submitBtn) {
        submitBtn.textContent = "Envoi de votre demande en cours...";
        submitBtn.disabled = true;
      }

      if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'form-feedback';
        feedback.textContent = '';
      }

      try {
        const formData = new FormData(form);

        // Nettoyer les espaces éventuels dans le numéro de téléphone pour Brevo
        const phoneVal = formData.get('SMS');
        if (phoneVal) {
          formData.set('SMS', phoneVal.toString().replace(/[\s.-]/g, ''));
        }

        const response = await fetch(actionAttr, {
          method: 'POST',
          body: formData,
          mode: 'cors'
        });

        if (response.ok) {
          if (feedback) {
            feedback.className = 'form-feedback success';
            feedback.textContent = "Votre demande a bien été envoyée ! Myriam vous répondra dans les plus brefs délais.";
            feedback.style.display = 'block';
          }

          if (submitBtn) {
            submitBtn.textContent = "Demande envoyée avec succès !";
            submitBtn.style.backgroundColor = "var(--vert)";
            submitBtn.style.color = "white";
          }

          form.reset();
        } else {
          throw new Error('Erreur HTTP ' + response.status);
        }
      } catch (err) {
        console.error("Erreur lors de l'envoi du formulaire Brevo:", err);
        if (feedback) {
          feedback.className = 'form-feedback error';
          feedback.textContent = "Une erreur est survenue lors de l'envoi (vérifiez si un bloqueur de publicités bloque la requête). Vous pouvez également me joindre directement au 07 62 35 52 18 ou par e-mail.";
          feedback.style.display = 'block';
        }
      } finally {
        setTimeout(function () {
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.style.backgroundColor = "";
            submitBtn.style.color = "";
            submitBtn.disabled = false;
          }
        }, 6000);
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
