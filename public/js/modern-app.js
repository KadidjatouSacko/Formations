// public/js/modern-app.js - Application JavaScript moderne
class FormProApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.setupToastSystem();
    this.setupMobileMenu();
    this.setupAnimations();
  }

  setupEventListeners() {
    // Navigation utilisateur
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
      this.setupUserMenu(userMenu);
    }

    // Formulaires
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.auth-form')) {
        this.handleFormSubmit(e);
      }
    });

    // Boutons d'action
    document.addEventListener('click', (e) => {
      // Boutons de formation
      if (e.target.matches('.btn[data-action]')) {
        this.handleFormationAction(e);
      }
      
      // Boutons demo
      if (e.target.matches('.demo-btn')) {
        this.handleDemoAccount(e);
      }
    });
  }

  setupUserMenu(userMenu) {
    const dropdown = userMenu.querySelector('.dropdown-menu');
    let isOpen = false;
    let timeoutId;

    userMenu.addEventListener('mouseenter', () => {
      clearTimeout(timeoutId);
      isOpen = true;
      dropdown.style.opacity = '1';
      dropdown.style.visibility = 'visible';
      dropdown.style.transform = 'translateY(0)';
    });

    userMenu.addEventListener('mouseleave', () => {
      timeoutId = setTimeout(() => {
        isOpen = false;
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-10px)';
      }, 150);
    });

    // Accessibilité clavier
    userMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isOpen = !isOpen;
        dropdown.style.opacity = isOpen ? '1' : '0';
        dropdown.style.visibility = isOpen ? 'visible' : 'hidden';
        dropdown.style.transform = isOpen ? 'translateY(0)' : 'translateY(-10px)';
      }
    });
  }

  handleFormSubmit(e) {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Afficher le loader
    this.showButtonLoading(submitBtn);
    
    // Le formulaire sera soumis normalement
    // Le loader sera masqué par le rechargement de page
  }

  showButtonLoading(button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <div class="btn-loading">
        <div class="spinner"></div>
        Connexion...
      </div>
    `;
    
    // Style pour le spinner dans le bouton
    if (!document.getElementById('btn-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'btn-spinner-styles';
      style.textContent = `
        .btn-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-loading .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }

  handleFormationAction(e) {
    const action = e.target.dataset.action;
    const formationId = e.target.dataset.formationId;
    const enrollmentId = e.target.dataset.enrollmentId;

    switch (action) {
      case 'continue':
        this.continueFormation(formationId, enrollmentId);
        break;
      case 'download-certificate':
        this.downloadCertificate(enrollmentId);
        break;
      case 'show-progress':
        this.showProgressModal(enrollmentId);
        break;
      case 'review-formation':
        this.reviewFormation(formationId);
        break;
    }
  }

  continueFormation(formationId, enrollmentId) {
    this.showToast('📚 Chargement de la formation...', 'info');
    // Redirection vers le lecteur
    setTimeout(() => {
      window.location.href = `/formations/${formationId}/learn`;
    }, 500);
  }

  downloadCertificate(enrollmentId) {
    this.showToast('📜 Préparation du certificat...', 'info');
    
    // Simuler le téléchargement
    setTimeout(() => {
      // Ici on ferait un appel API réel
      this.showToast('✅ Certificat téléchargé avec succès !', 'success');
      
      // Simulation d'un téléchargement
      const link = document.createElement('a');
      link.href = `/api/certificates/${enrollmentId}/download`;
      link.download = `certificat-${enrollmentId}.pdf`;
      link.click();
    }, 1500);
  }

  showProgressModal(enrollmentId) {
    // Pour l'instant, une alerte simple
    // Dans une vraie app, on ouvrirait un modal
    this.showToast('📊 Chargement des détails...', 'info');
    
    setTimeout(() => {
      alert(`📊 Progression détaillée\n\nDétails de votre progression :\n• Modules terminés : 3/5\n• Temps passé : 2h15min\n• Dernière activité : Il y a 1h\n• Score moyen : 92%\n\nContinuez vos efforts ! 💪`);
    }, 800);
  }

  reviewFormation(formationId) {
    this.showToast('🔄 Redirection vers la formation...', 'info');
    setTimeout(() => {
      window.location.href = `/formations/${formationId}?mode=review`;
    }, 500);
  }

  handleDemoAccount(e) {
    const email = e.target.dataset.email;
    const password = e.target.dataset.password;
    
    if (email && password) {
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password;
        
        // Animation de remplissage
        emailInput.style.transform = 'scale(1.02)';
        passwordInput.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
          emailInput.style.transform = '';
          passwordInput.style.transform = '';
        }, 200);
        
        this.showToast('✨ Compte de démonstration sélectionné', 'success');
      }
    }
  }

  initializeComponents() {
    // Initialiser les progress bars animées
    this.animateProgressBars();
    
    // Initialiser les compteurs animés
    this.animateCounters();
    
    // Initialiser les cartes avec effet hover
    this.initializeCards();
  }

  animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach((bar, index) => {
      const width = bar.style.width || bar.dataset.width || '0%';
      bar.style.width = '0%';
      
      setTimeout(() => {
        bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        bar.style.width = width;
      }, index * 200);
    });
  }

  animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    
    counters.forEach((counter) => {
      const target = parseInt(counter.textContent.replace(/\D/g, '')) || 0;
      let current = 0;
      const increment = target / 30;
      const suffix = counter.textContent.replace(/\d/g, '');
      
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = Math.round(current) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + suffix;
        }
      };
      
      // Observer pour déclencher l'animation quand visible
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(updateCounter, Math.random() * 500);
              observer.unobserve(entry.target);
            }
          });
        });
        
        observer.observe(counter);
      } else {
        setTimeout(updateCounter, 500);
      }
    });
  }

  initializeCards() {
    const cards = document.querySelectorAll('.formation-card, .stat-card, .badge-item');
    
    cards.forEach((card, index) => {
      // Animation d'apparition
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
      
      // Effet de parallax léger au survol
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '';
      });
    });
  }

  setupToastSystem() {
    // Créer le conteneur de toasts s'il n'existe pas
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Styles pour le bouton de fermeture
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.25rem;
      opacity: 0.7;
      transition: opacity 0.2s;
      padding: 0 0.5rem;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '1';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.opacity = '0.7';
    });
    
    container.appendChild(toast);
    
    // Animation d'apparition
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Auto-suppression
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, duration);
  }

  setupMobileMenu() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const courseSidebar = document.getElementById('courseSidebar');
    
    if (sidebarToggle && courseSidebar) {
      sidebarToggle.addEventListener('click', () => {
        courseSidebar.classList.toggle('open');
        const isOpen = courseSidebar.classList.contains('open');
        sidebarToggle.innerHTML = isOpen ? '✕' : '☰';
      });
      
      // Fermer le menu en cliquant sur le contenu principal
      document.addEventListener('click', (e) => {
        if (!courseSidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          courseSidebar.classList.remove('open');
          sidebarToggle.innerHTML = '☰';
        }
      });
    }
  }

  setupAnimations() {
    // Observer pour les animations au scroll
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });
      
      // Observer tous les éléments avec animation
      document.querySelectorAll('[data-aos]').forEach((el) => {
        observer.observe(el);
      });
    }
  }

  // Méthodes utilitaires
  formatTime(minutes) {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins} min`;
  }

  formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    return date.toLocaleDateString('fr-FR', defaultOptions);
  }

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  }

  // API utilitaires
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      this.showToast('Erreur de connexion', 'error');
      throw error;
    }
  }

  // Méthodes d'accessibilité
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Gestion des erreurs globales
  handleGlobalError(error) {
    console.error('Erreur globale:', error);
    
    if (error.name === 'NetworkError') {
      this.showToast('Problème de connexion réseau', 'error');
    } else if (error.status === 401) {
      this.showToast('Session expirée, redirection...', 'warning');
      setTimeout(() => {
        window.location.href = '/connexion';
      }, 2000);
    } else {
      this.showToast('Une erreur inattendue s\'est produite', 'error');
    }
  }
}

// Classe pour la gestion du lecteur de formation
class FormationReader {
  constructor() {
    this.currentModuleIndex = 0;
    this.modules = [];
    this.startTime = Date.now();
    this.timeSpent = 0;
    
    this.init();
  }

  init() {
    this.setupModuleNavigation();
    this.setupProgressTracking();
    this.setupReadingProgress();
    this.loadModuleContent();
  }

  setupModuleNavigation() {
    const moduleItems = document.querySelectorAll('.module-item');
    
    moduleItems.forEach((item, index) => {
      if (!item.classList.contains('locked')) {
        item.addEventListener('click', () => {
          this.goToModule(index);
        });
      }
    });

    // Navigation clavier
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.previousModule();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.nextModule();
            break;
        }
      }
    });
  }

  setupProgressTracking() {
    // Sauvegarder la progression toutes les 2 minutes
    setInterval(() => {
      this.saveProgress();
    }, 120000);

    // Sauvegarder avant de quitter la page
    window.addEventListener('beforeunload', () => {
      this.saveProgress();
    });
  }

  setupReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }

  loadModuleContent() {
    // Simuler le chargement du contenu du module actuel
    const moduleTitle = document.querySelector('.module-item.active .module-title');
    if (moduleTitle) {
      document.title = `${moduleTitle.textContent} | FormaPro+`;
    }

    // Mettre à jour la progression globale
    this.updateGlobalProgress();
  }

  goToModule(moduleIndex) {
    const moduleItems = document.querySelectorAll('.module-item');
    
    if (moduleIndex < 0 || moduleIndex >= moduleItems.length) return;
    
    // Sauvegarder la progression du module actuel
    this.saveProgress();
    
    // Mettre à jour l'état des modules
    moduleItems.forEach((item, index) => {
      item.classList.remove('active');
      if (index === moduleIndex) {
        item.classList.add('active');
      }
    });
    
    this.currentModuleIndex = moduleIndex;
    this.startTime = Date.now();
    
    // Charger le nouveau contenu
    this.loadModuleContent();
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    app.showToast(`Module ${moduleIndex + 1} chargé`, 'info', 2000);
  }

  previousModule() {
    if (this.currentModuleIndex > 0) {
      this.goToModule(this.currentModuleIndex - 1);
    }
  }

  nextModule() {
    const moduleItems = document.querySelectorAll('.module-item');
    if (this.currentModuleIndex < moduleItems.length - 1) {
      this.goToModule(this.currentModuleIndex + 1);
    }
  }

  async markModuleComplete() {
    try {
      // Marquer le module actuel comme terminé
      const currentModule = document.querySelectorAll('.module-item')[this.currentModuleIndex];
      currentModule.classList.add('completed');
      currentModule.classList.remove('active');
      
      const icon = currentModule.querySelector('.module-icon');
      const status = currentModule.querySelector('.module-status');
      
      if (icon) icon.textContent = '✅';
      if (status) {
        status.textContent = 'Terminé';
        status.className = 'module-status completed';
      }
      
      // Animation de succès
      currentModule.style.transform = 'scale(1.05)';
      setTimeout(() => {
        currentModule.style.transform = '';
      }, 300);
      
      app.showToast('✅ Module terminé avec succès !', 'success');
      app.announceToScreenReader('Module terminé avec succès');
      
      // Déverrouiller le module suivant
      const nextModule = document.querySelectorAll('.module-item')[this.currentModuleIndex + 1];
      if (nextModule && nextModule.classList.contains('locked')) {
        nextModule.classList.remove('locked');
        const nextIcon = nextModule.querySelector('.module-icon');
        const nextStatus = nextModule.querySelector('.module-status');
        
        if (nextIcon) nextIcon.textContent = '⭕';
        if (nextStatus) {
          nextStatus.textContent = 'Disponible';
          nextStatus.className = 'module-status';
        }
      }
      
      // Sauvegarder la progression
      await this.saveProgress();
      
      // Passer au module suivant après 2 secondes
      setTimeout(() => {
        if (this.currentModuleIndex < document.querySelectorAll('.module-item').length - 1) {
          this.nextModule();
        } else {
          this.showFormationCompleted();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erreur completion module:', error);
      app.showToast('❌ Erreur lors de la validation', 'error');
    }
  }

  updateGlobalProgress() {
    const completedModules = document.querySelectorAll('.module-item.completed').length;
    const totalModules = document.querySelectorAll('.module-item').length;
    const progress = Math.round((completedModules / totalModules) * 100);
    
    const progressFill = document.querySelector('.overall-progress .progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressPercentage) progressPercentage.textContent = `${progress}%`;
    
    // Mettre à jour les stats
    const statsModules = document.querySelector('.stat-item .stat-value');
    if (statsModules) {
      statsModules.textContent = `${completedModules}/${totalModules}`;
    }
  }

  async saveProgress() {
    this.timeSpent += Math.floor((Date.now() - this.startTime) / 60000); // en minutes
    
    const progressData = {
      moduleIndex: this.currentModuleIndex,
      timeSpent: this.timeSpent,
      progress: Math.round((this.currentModuleIndex / document.querySelectorAll('.module-item').length) * 100)
    };
    
    try {
      // Sauvegarder dans localStorage en attendant l'API
      localStorage.setItem('formation_progress', JSON.stringify(progressData));
      
      // TODO: Appel API pour sauvegarder en base
      // await app.makeRequest('/api/progress', {
      //   method: 'POST',
      //   body: JSON.stringify(progressData)
      // });
      
    } catch (error) {
      console.error('Erreur sauvegarde progression:', error);
    }
    
    this.startTime = Date.now();
  }

  showFormationCompleted() {
    // Animation de confetti (simple)
    this.createConfetti();
    
    app.showToast('🎉 Félicitations ! Formation terminée avec succès !', 'success', 6000);
    
    // Modal de félicitations
    setTimeout(() => {
      const confirmed = confirm(
        '🎉 Félicitations !\n\n' +
        'Vous avez terminé cette formation avec succès.\n' +
        'Votre certificat sera bientôt disponible dans votre dashboard.\n\n' +
        'Souhaitez-vous retourner à votre tableau de bord ?'
      );
      
      if (confirmed) {
        window.location.href = '/dashboard';
      }
    }, 3000);
  }

  createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}vw;
          top: -10px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          animation: confetti-fall 3s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }, i * 50);
    }
    
    // Ajouter l'animation CSS si pas déjà présente
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Initialisation globale
let app;
let reader;

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser l'application principale
  app = new FormProApp();
  
  // Initialiser le lecteur de formation si on est sur cette page
  if (document.querySelector('.learning-layout')) {
    reader = new FormationReader();
  }
  
  // Gérer les erreurs globales
  window.addEventListener('error', (event) => {
    app.handleGlobalError(event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    app.handleGlobalError(event.reason);
  });
  
  console.log('🚀 FormaPro+ Application initialisée');
});

// Fonctions globales pour les templates EJS
window.showToast = (message, type, duration) => {
  if (app) app.showToast(message, type, duration);
};

window.downloadCertificate = (enrollmentId) => {
  if (app) app.downloadCertificate(enrollmentId);
};

window.showProgressModal = (enrollmentId) => {
  if (app) app.showProgressModal(enrollmentId);
};

window.markModuleComplete = () => {
  if (reader) reader.markModuleComplete();
};

window.fillDemo = (email, password) => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput && passwordInput) {
    emailInput.value = email;
    passwordInput.value = password;
    showToast('✨ Compte de démonstration sélectionné', 'success');
  }
};