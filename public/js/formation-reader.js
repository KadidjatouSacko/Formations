
// public/js/formation-reader.js - Script pour le lecteur de formation
class FormationReader {
  constructor() {
    this.api = window.FormProAPI;
    this.currentUser = this.api.getCurrentUser();
    
    if (!this.currentUser) {
      window.location.href = '/login.html';
      return;
    }
    
    // Récupérer l'ID d'inscription depuis l'URL
    const params = new URLSearchParams(window.location.search);
    this.enrollmentId = params.get('enrollment');
    
    if (!this.enrollmentId) {
      this.showError('Inscription non trouvée');
      return;
    }
    
    this.currentModuleIndex = 0;
    this.modules = [];
    this.enrollment = null;
    
    this.init();
  }
  
  async init() {
    try {
      await this.loadEnrollmentData();
      this.setupEventListeners();
      this.startProgressTracking();
    } catch (error) {
      console.error('Erreur initialisation lecteur:', error);
      this.showError('Erreur lors du chargement de la formation');
    }
  }
  
  async loadEnrollmentData() {
    // Charger les données d'inscription avec la formation et modules
    const response = await fetch(`/api/enrollments/${this.enrollmentId}`, {
      headers: this.api.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur chargement inscription');
    }
    
    const data = await response.json();
    this.enrollment = data.enrollment;
    this.modules = data.enrollment.formation.modules;
    
    // Trouver le module courant
    const currentModuleId = this.enrollment.current_module_id;
    this.currentModuleIndex = this.modules.findIndex(m => m.id === currentModuleId) || 0;
    
    this.renderFormationInterface();
    this.loadCurrentModule();
  }
  
  renderFormationInterface() {
    // Mettre à jour le titre de la formation
    document.title = `${this.enrollment.formation.title} | FormaPro+`;
    
    // Mettre à jour la sidebar avec les modules
    this.renderModulesList();
    
    // Mettre à jour les informations de formation
    this.updateFormationInfo();
  }
  
  renderModulesList() {
    const modulesList = document.querySelector('.module-list');
    if (!modulesList) return;
    
    modulesList.innerHTML = `
      <div class="module-section">
        <h3 class="section-title">Modules de formation</h3>
        ${this.modules.map((module, index) => this.createModuleItem(module, index)).join('')}
      </div>
    `;
  }
  
  createModuleItem(module, index) {
    const progress = this.enrollment.moduleProgress?.find(mp => mp.module_id === module.id);
    const status = progress?.status || 'not_started';
    const isActive = index === this.currentModuleIndex;
    const isLocked = index > this.currentModuleIndex && status === 'not_started';
    
    const statusIcon = this.getModuleStatusIcon(status, isLocked);
    const statusClass = this.getModuleStatusClass(status, isActive, isLocked);
    const statusText = this.getModuleStatusText(status, isLocked);
    
    return `
      <div class="module-item ${statusClass}" data-module-index="${index}">
        <div class="module-content">
          <div class="module-header">
            <div class="module-icon">${statusIcon}</div>
            <div class="module-title">${module.title}</div>
          </div>
          <div class="module-meta">
            <div class="module-duration">
              <span>⏱️</span>
              <span>${this.formatDuration(module.estimated_duration)}</span>
            </div>
            <div class="module-status ${statusClass}">${statusText}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  updateFormationInfo() {
    // Titre de la formation
    const courseTitle = document.querySelector('.course-title');
    if (courseTitle) {
      courseTitle.textContent = this.enrollment.formation.title;
    }
    
    // Sous-titre
    const courseSubtitle = document.querySelector('.course-subtitle');
    if (courseSubtitle) {
      courseSubtitle.textContent = `Module ${this.currentModuleIndex + 1}/${this.modules.length}`;
    }
    
    // Progression globale
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    if (progressFill && progressPercentage) {
      const percentage = this.enrollment.progress_percentage || 0;
      progressFill.style.width = `${percentage}%`;
      progressPercentage.textContent = `${percentage}%`;
    }
    
    // Statistiques
    this.updateProgressStats();
  }
  
  updateProgressStats() {
    const completedModules = this.enrollment.moduleProgress?.filter(mp => mp.status === 'completed').length || 0;
    const totalTime = this.enrollment.time_spent || 0;
    const avgScore = 94; // À calculer dynamiquement depuis les quiz
    
    const stats = document.querySelectorAll('.stat-value');
    if (stats.length >= 3) {
      stats[0].textContent = `${completedModules}/${this.modules.length}`;
      stats[1].textContent = this.formatTime(totalTime);
      stats[2].textContent = `${avgScore}%`;
    }
  }
  
  async loadCurrentModule() {
    const currentModule = this.modules[this.currentModuleIndex];
    if (!currentModule) return;
    
    // Marquer le module comme démarré si ce n'est pas déjà fait
    await this.markModuleAsStarted(currentModule.id);
    
    // Charger le contenu du module
    this.renderModuleContent(currentModule);
    
    // Mettre à jour la sidebar
    this.updateModulesList();
  }
  
  async markModuleAsStarted(moduleId) {
    try {
      await this.api.updateModuleProgress(this.enrollmentId, moduleId, {
        status: 'in_progress'
      });
    } catch (error) {
      console.error('Erreur marquage module:', error);
    }
  }
  
  renderModuleContent(module) {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;
    
    // Générer le contenu basé sur le type de module
    switch (module.module_type) {
      case 'video':
        this.renderVideoContent(module);
        break;
      case 'text':
        this.renderTextContent(module);
        break;
      case 'quiz':
        this.renderQuizContent(module);
        break;
      default:
        this.renderDefaultContent(module);
    }
  }
  
  renderVideoContent(module) {
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = `
      <section class="video-section">
        <div class="video-player">
          <video id="module-video" controls>
            <source src="${module.video_url}" type="video/mp4">
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
        <div class="video-info">
          <h2>${module.title}</h2>
          <p>${module.description || ''}</p>
        </div>
      </section>
      
      <section class="module-actions">
        <button class="btn btn-secondary" onclick="reader.previousModule()" ${this.currentModuleIndex === 0 ? 'disabled' : ''}>
          ← Module précédent
        </button>
        <button class="btn btn-primary" onclick="reader.markModuleComplete()" id="complete-module-btn">
          ✅ Marquer comme terminé
        </button>
        <button class="btn btn-secondary" onclick="reader.nextModule()" ${this.currentModuleIndex === this.modules.length - 1 ? 'disabled' : ''}>
          Module suivant →
        </button>
      </section>
    `;
    
    // Setup video tracking
    this.setupVideoTracking();
  }
  
  renderTextContent(module) {
    const contentArea = document.querySelector('.content-area');
    const content = module.content || {};
    
    contentArea.innerHTML = `
      <article class="text-content">
        <header class="content-header">
          <h1>${module.title}</h1>
          ${module.description ? `<p class="content-description">${module.description}</p>` : ''}
        </header>
        
        <div class="content-body">
          ${content.html || '<p>Contenu en cours de préparation...</p>'}
        </div>
        
        ${module.resources?.length ? this.renderResources(module.resources) : ''}
      </article>
      
      <section class="module-actions">
        <button class="btn btn-secondary" onclick="reader.previousModule()" ${this.currentModuleIndex === 0 ? 'disabled' : ''}>
          ← Module précédent
        </button>
        <button class="btn btn-primary" onclick="reader.markModuleComplete()" id="complete-module-btn">
          ✅ Marquer comme terminé
        </button>
        <button class="btn btn-secondary" onclick="reader.nextModule()" ${this.currentModuleIndex === this.modules.length - 1 ? 'disabled' : ''}>
          Module suivant →
        </button>
      </section>
    `;
    
    // Démarrer le tracking de lecture
    this.startReadingTracking();
  }
  
  renderResources(resources) {
    return `
      <section class="resources-section">
        <h3>📎 Ressources téléchargeables</h3>
        <div class="downloads-grid">
          ${resources.map(resource => `
            <div class="download-item">
              <div class="download-icon">📄</div>
              <div class="download-info">
                <div class="download-title">${resource.title}</div>
                <div class="download-meta">${resource.file_type?.toUpperCase()} • ${this.formatFileSize(resource.file_size)}</div>
              </div>
              <a href="${resource.file_url}" class="btn btn-sm" download>⬇️</a>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
  
  setupEventListeners() {
    // Navigation dans les modules
    document.addEventListener('click', (e) => {
      if (e.target.closest('.module-item')) {
        const moduleIndex = parseInt(e.target.closest('.module-item').dataset.moduleIndex);
        if (moduleIndex !== this.currentModuleIndex) {
          this.goToModule(moduleIndex);
        }
      }
    });
    
    // Raccourcis clavier
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
  
  setupVideoTracking() {
    const video = document.getElementById('module-video');
    if (!video) return;
    
    let watchTime = 0;
    let lastTimeUpdate = 0;
    
    video.addEventListener('timeupdate', () => {
      const currentTime = video.currentTime;
      if (currentTime > lastTimeUpdate + 1) {
        watchTime += currentTime - lastTimeUpdate;
      }
      lastTimeUpdate = currentTime;
      
      // Mettre à jour la progression
      const progress = Math.min(100, (currentTime / video.duration) * 100);
      this.updateModuleProgress({ 
        progress_percentage: Math.round(progress),
        time_spent: Math.round(watchTime / 60) 
      });
    });
    
    video.addEventListener('ended', () => {
      // Marquer automatiquement comme terminé quand la vidéo se termine
      this.markModuleComplete();
    });
  }
  
  startReadingTracking() {
    // Simuler le tracking de lecture pour le contenu textuel
    this.readingStartTime = Date.now();
    
    this.readingInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - this.readingStartTime) / 60000);
      this.updateModuleProgress({ 
        progress_percentage: Math.min(100, timeSpent * 10), // 10% par minute
        time_spent: timeSpent 
      });
    }, 30000); // Mise à jour toutes les 30 secondes
  }
  
  startProgressTracking() {
    // Sauvegarder la progression toutes les 2 minutes
    setInterval(() => {
      this.saveProgress();
    }, 120000);
  }
  
  async updateModuleProgress(progressData) {
    try {
      await this.api.updateModuleProgress(
        this.enrollmentId, 
        this.modules[this.currentModuleIndex].id, 
        progressData
      );
    } catch (error) {
      console.error('Erreur mise à jour progression:', error);
    }
  }
  
  async markModuleComplete() {
    try {
      const moduleId = this.modules[this.currentModuleIndex].id;
      
      await this.api.updateModuleProgress(this.enrollmentId, moduleId, {
        status: 'completed',
        progress_percentage: 100,
        time_spent: Math.round((Date.now() - (this.readingStartTime || Date.now())) / 60000)
      });
      
      this.showToast('✅ Module terminé avec succès !', 'success');
      
      // Mettre à jour l'interface
      this.updateModulesList();
      
      // Passer au module suivant automatiquement après 2 secondes
      setTimeout(() => {
        if (this.currentModuleIndex < this.modules.length - 1) {
          this.nextModule();
        } else {
          this.showFormationCompleted();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erreur completion module:', error);
      this.showToast('❌ Erreur lors de la validation', 'error');
    }
  }
  
  // Navigation entre modules
  async goToModule(moduleIndex) {
    if (moduleIndex < 0 || moduleIndex >= this.modules.length) return;
    
    // Sauvegarder la progression du module actuel
    await this.saveProgress();
    
    this.currentModuleIndex = moduleIndex;
    await this.loadCurrentModule();
  }
  
  previousModule() {
    if (this.currentModuleIndex > 0) {
      this.goToModule(this.currentModuleIndex - 1);
    }
  }
  
  nextModule() {
    if (this.currentModuleIndex < this.modules.length - 1) {
      this.goToModule(this.currentModuleIndex + 1);
    }
  }
  
  async saveProgress() {
    const timeSpent = Math.round((Date.now() - (this.readingStartTime || Date.now())) / 60000);
    await this.updateModuleProgress({ time_spent: timeSpent });
  }
  
  showFormationCompleted() {
    // Afficher un modal ou rediriger vers une page de félicitations
    alert('🎉 Félicitations !\n\nVous avez terminé cette formation avec succès.\nVotre certificat sera bientôt disponible.');
    
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 3000);
  }
  
  // Méthodes utilitaires
  getModuleStatusIcon(status, isLocked) {
    if (isLocked) return '🔒';
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '▶️';
      default: return '⭕';
    }
  }
  
  getModuleStatusClass(status, isActive, isLocked) {
    if (isLocked) return 'locked';
    if (isActive) return 'active';
    if (status === 'completed') return 'completed';
    return '';
  }
  
  getModuleStatusText(status, isLocked) {
    if (isLocked) return 'Verrouillé';
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      default: return 'Non démarré';
    }
  }
  
  formatDuration(minutes) {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
  
  formatTime(minutes) {
    return this.formatDuration(minutes);
  }
  
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  updateModulesList() {
    this.renderModulesList();
  }
  
  showError(message) {
    this.showToast(`❌ ${message}`, 'error');
  }
  
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Initialisation automatique selon la page
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier quelle page nous sommes
  const path = window.location.pathname;
  
  if (path.includes('dashboard') || path.includes('mon-espace')) {
    window.dashboard = new DashboardManager();
  } else if (path.includes('lecteur-formation') || path.includes('formation-reader')) {
    window.reader = new FormationReader();
  }
  
  // Vérifier l'authentification sur toutes les pages protégées
  if (!window.FormProAPI.isAuthenticated() && !path.includes('login') && !path.includes('register')) {
    window.location.href = '/login.html';
  }
});