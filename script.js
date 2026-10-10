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
      const actionAttr = form.getAttribute('action') || "https://formsubmit.co/myriamdarracq.educatrice@gmail.com";

      e.preventDefault();

      // Vérification validation native HTML5
      if (!form.checkValidity()) {
        console.log("submit: Formulaire non valide selon les règles HTML5");
        form.reportValidity();
        return;
      }

      // Protection antispam Honeypot
      const honeypot = form.querySelector('input[name="_honey"]');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam détecté.');
        return;
      }

      const originalText = submitBtn ? submitBtn.textContent : "Envoyer ma demande";
      if (submitBtn) {
        submitBtn.textContent = "Envoi de votre message...";
        submitBtn.disabled = true;
      }

      if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'form-feedback';
        feedback.textContent = '';
      }

      // Avertissement spécifique si le fichier est ouvert en local (double-clic file://)
      if (window.location.protocol === 'file:') {
        if (feedback) {
          feedback.className = 'form-feedback error';
          feedback.textContent = "Note : Vous visualisez le site en local (file://). Pour envoyer de vrais e-mails, le formulaire fonctionne sur votre site en ligne déployé (Vercel) ou via un serveur local.";
          feedback.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
        return;
      }

      try {
        const formData = new FormData(form);
        const data = {};
        formData.forEach(function (value, key) {
          if (key !== '_honey') {
            data[key] = value;
          }
        });

        // Endpoint AJAX de FormSubmit
        const ajaxEndpoint = actionAttr.includes('/ajax/')
          ? actionAttr
          : actionAttr.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        const response = await fetch(ajaxEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && (result.success === "true" || result.success === true)) {
          if (feedback) {
            feedback.className = 'form-feedback success';
            feedback.textContent = "Votre message a bien été envoyé ! Myriam vous répondra dans les plus brefs délais.";
            feedback.style.display = 'block';
          }

          if (submitBtn) {
            submitBtn.textContent = "Message envoyé avec succès !";
            submitBtn.style.backgroundColor = "var(--vert)";
            submitBtn.style.color = "white";
          }

          form.reset();
        } else if (result.message && result.message.toLowerCase().includes("activation")) {
          // Premier envoi : demande d'activation par e-mail
          if (feedback) {
            feedback.className = 'form-feedback success';
            feedback.textContent = "Message envoyé ! Lors de ce premier envoi, vérifiez la boîte mail myriamdarracq.educatrice@gmail.com et cliquez sur le lien d'activation pour valider le formulaire.";
            feedback.style.display = 'block';
          }
          form.reset();
        } else {
          throw new Error(result.message || 'Erreur lors de l\'envoi');
        }
      } catch (err) {
        console.error("Erreur lors de l'envoi du formulaire:", err);
        if (feedback) {
          feedback.className = 'form-feedback error';
          feedback.textContent = "Une erreur est survenue lors de l'envoi. Vous pouvez également me joindre directement par téléphone au 07 62 35 52 18 ou par e-mail à myriamdarracq.educatrice@gmail.com.";
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
      const isOpen = toggleBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.setAttribute('aria-label', isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation');
      
      // Empêche le défilement de l'arrière-plan du site lorsque le menu est ouvert
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      if (navMenu.classList.contains('active')) {
        toggleBtn.classList.remove('active');
        navMenu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
        document.body.style.overflow = '';
      }
    }

    toggleBtn.addEventListener('click', toggleMenu);

    // Ferme le menu lors du clic sur un lien
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Ferme le menu si clic sur l'arrière-plan
    navMenu.addEventListener('click', function (e) {
      if (e.target === navMenu) {
        closeMenu();
      }
    });

    // Accessibilité : Fermeture avec la touche Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
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
