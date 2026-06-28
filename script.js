/* =========================================================
   Lorem Ipsum — Interactions
   ========================================================= */
(function () {
  "use strict";

  /* ----- Menu mobile ----- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Ferme le menu après un clic sur un lien (mobile)
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ----- Année dynamique dans le footer ----- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Bouton « retour en haut » ----- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----- Apparition des éléments au scroll ----- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Repli : tout afficher si l'API n'est pas supportée
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ----- Validation du formulaire de contact (sans backend) ----- */
  var form = document.getElementById("contactForm");
  var feedback = document.getElementById("formFeedback");

  function showError(field, message) {
    var input = form.elements[field];
    var errorEl = form.querySelector('.error[data-for="' + field + '"]');
    if (input) input.classList.add("invalid");
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(field) {
    var input = form.elements[field];
    var errorEl = form.querySelector('.error[data-for="' + field + '"]');
    if (input) input.classList.remove("invalid");
    if (errorEl) errorEl.textContent = "";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    // Efface l'erreur dès que l'utilisateur corrige le champ
    ["name", "email", "message"].forEach(function (field) {
      form.elements[field].addEventListener("input", function () {
        clearError(field);
      });
    });

    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      feedback.textContent = "";
      feedback.classList.remove("success", "error");

      var valid = true;
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();

      if (name.length < 2) {
        showError("name", "Merci d'indiquer votre nom.");
        valid = false;
      }
      if (!isValidEmail(email)) {
        showError("email", "Adresse e-mail invalide.");
        valid = false;
      }
      if (message.length < 10) {
        showError("message", "Votre message doit faire au moins 10 caractères.");
        valid = false;
      }

      if (!valid) return;

      // Envoi réel via Web3Forms (compatible GitHub Pages, sans backend)
      var btnLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours…";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.success) {
            feedback.classList.add("success");
            feedback.textContent =
              "Merci " + name + " ! Votre message a bien été envoyé. Nous vous répondrons rapidement.";
            form.reset();
          } else {
            throw new Error(data.message || "Erreur d'envoi");
          }
        })
        .catch(function () {
          feedback.classList.add("error");
          feedback.textContent =
            "Une erreur est survenue. Merci de réessayer ou de nous écrire directement par email.";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = btnLabel;
        });
    });
  }
})();
