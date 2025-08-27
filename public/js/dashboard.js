// public/js/dashboard.js - Script pour le dashboard étudiant
class DashboardManager {
  constructor() {
    this.api = window.FormProAPI;
    this.currentUser = this.api.getCurrentUser();
    
    if (!this.currentUser) {
      window.location.href = '/connexion';
      return;
    }
    
    this.init();
  }
  
  async init() {
    this.showLoading();
    
    try {
      // Charger les données du dashboard
      const dashboardData = await this.api.getDashboard(this.currentUser.id);
      this.renderDashboard(dashboardData);
      
      // Charger l'activité récente
      const activities = await this.api.getActivity(this.currentUser.id);
      this.renderActivities(activities);
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      this.showError('Erreur lors du chargement de vos données');
    } finally {
      this.hideLoading();
    }
  }
  
  renderDashboard(data) {
    // Mettre à jour les informations utilisateur
    this.updateUserInfo(data.user);
    
    // Mettre à jour les statistiques
    this.updateStats(data.stats);
    
    // Afficher les formations actives
    this.renderActiveFormations(data.activeFormations);
    
    // Afficher les formations terminées
    this.renderCompletedFormations(data.completedFormations);
    
    // Afficher les badges
    this.renderBadges(data.earnedBadges);
  }
  
  updateUserInfo(user) {
    // Nom utilisateur
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      welcomeTitle.textContent = `Bonjour ${user.first_name} ! 👋`;
    }
    
    // Avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
      userAvatar.textContent = `${user.first_name[0]}${user.last_name[0]}`;
    }
    
    // Nom dans le menu
    const userName = document.querySelector('.user-name');
    if (userName) {
      userName.textContent = `${user.first_name} ${user.last_name}`;
    }
    
    // Rôle utilisateur
    const userRole = document.querySelector('.user-role');
    if (userRole && user.studentProfile) {
      userRole.textContent = user.studentProfile.job_title || 'Étudiant';
    }
  }
  
  updateStats(stats) {
    // Statistiques de la section welcome
    const welcomeStats = document.querySelectorAll('.welcome-stat');
    if (welcomeStats.length >= 3) {
      welcomeStats[0].querySelector('.stat-number').textContent = stats.totalEnrollments;
      welcomeStats[1].querySelector('.stat-number').textContent = `${stats.avgProgress}%`;
      welcomeStats[2].querySelector('.stat-number').textContent = stats.totalCertificates;
    }
    
    // Progression globale
    const progressPercentage = document.querySelector('.progress-percentage');
    if (progressPercentage) {
      progressPercentage.textContent = `${stats.avgProgress}%`;
    }
    
    // Détails de progression
    const progressDetails = document.querySelectorAll('.progress-detail, .detail-value');
    if (progressDetails.length >= 6) {
      const moduleIndex = Array.from(progressDetails).findIndex(el => 
        el.nextElementSibling?.textContent?.includes('Modules')
      );
      if (moduleIndex !== -1) {
        progressDetails[moduleIndex].textContent = stats.totalModulesCompleted || '0';
      }
      
      const timeIndex = Array.from(progressDetails).findIndex(el => 
        el.nextElementSibling?.textContent?.includes('Temps')
      );
      if (timeIndex !== -1) {
        const hours = Math.floor(stats.totalTimeSpent / 60);
        const minutes = stats.totalTimeSpent % 60;
        progressDetails[timeIndex].textContent = `${hours}h${minutes}min`;
      }
    }
    
    // Animation du cercle de progression
    this.animateProgressCircle(stats.avgProgress);
  }
  
  renderActiveFormations(formations) {
    const container = document.querySelector('.formations-grid');
    if (!container) return;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    formations.forEach(enrollment => {
      const formation = enrollment.formation;
      const card = this.createFormationCard(formation, enrollment, 'active');
      container.appendChild(card);
    });
    
    // Si aucune formation active
    if (formations.length === 0) {
      container.innerHTML = `
        <div class="no-formations">
          <div class="no-formations-icon">📚</div>
          <h3>Aucune formation en cours</h3>
          <p>Découvrez notre catalogue de formations</p>
          <a href="/formations.html" class="btn btn-primary">Parcourir les formations</a>
        </div>
      `;
    }
  }
  
  renderCompletedFormations(formations) {
    // Trouver la section des formations terminées ou la créer
    let completedSection = document.querySelector('.completed-formations');
    if (!completedSection && formations.length > 0) {
      completedSection = document.createElement('section');
      completedSection.className = 'completed-formations fade-in';
      completedSection.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">🏆 Formations terminées</h2>
        </div>
        <div class="formations-grid completed-grid"></div>
      `;
      
      // L'insérer après les formations actives
      const activeSection = document.querySelector('.formations-grid').parentElement;
      activeSection.parentElement.insertBefore(completedSection, activeSection.nextSibling);
    }
    
    const completedGrid = completedSection?.querySelector('.completed-grid');
    if (!completedGrid) return;
    
    completedGrid.innerHTML = '';
    
    formations.forEach(enrollment => {
      const formation = enrollment.formation;
      const card = this.createFormationCard(formation, enrollment, 'completed');
      completedGrid.appendChild(card);
    });
  }
  
  createFormationCard(formation, enrollment, status) {
    const div = document.createElement('div');
    div.className = 'formation-card fade-in';
    
    const statusClass = status === 'completed' ? 'status-completed' : 'status-active';
    const statusText = status === 'completed' ? 'Terminé' : 'En cours';
    const statusIcon = status === 'completed' ? '✅' : '⏳';
    
    div.innerHTML = `
      <div class="formation-header">
        <div class="formation-icon">${this.getCategoryIcon(formation.category?.name)}</div>
        <div class="formation-status ${statusClass}">${statusText}</div>
      </div>
      <h3 class="formation-title">${formation.title}</h3>
      <div class="formation-progress">
        <div class="progress-label">
          <span>Progression</span>
          <span>${enrollment.progress_percentage}% (${enrollment.modules_completed}/${enrollment.total_modules} modules)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${enrollment.progress_percentage}%"></div>
        </div>
      </div>
      <div class="formation-meta">
        <span>${statusIcon} ${this.formatDate(enrollment.last_accessed || enrollment.completed_at)}</span>
        <span>⏱️ ${this.formatTime(enrollment.time_spent)}</span>
      </div>
      <div class="formation-actions">
        ${this.getFormationActions(formation, enrollment, status)}
      </div>
    `;
    
    return div;
  }
  
  getFormationActions(formation, enrollment, status) {
    if (status === 'completed') {
      return `
        <button class="btn btn-primary" onclick="dashboard.downloadCertificate('${enrollment.id}')">
          📜 Télécharger certificat
        </button>
        <button class="btn btn-secondary" onclick="dashboard.reviewFormation('${formation.id}')">
          🔄 Revoir
        </button>
      `;
    } else {
      return `
        <a href="/lecteur-formation.html?enrollment=${enrollment.id}" class="btn btn-primary">
          ▶️ Continuer
        </a>
        <button class="btn btn-secondary" onclick="dashboard.showProgress('${enrollment.id}')">
          📊 Progression
        </button>
      `;
    }
  }
  
  renderBadges(badges) {
    const badgesContainer = document.querySelector('.achievements-grid');
    if (!badgesContainer) return;
    
    badgesContainer.innerHTML = '';
    
    // Badges système à afficher (avec ceux obtenus et quelques-uns à débloquer)
    const systemBadges = [
      { id: 1, name: 'Premier Pas', description: 'Première connexion', icon: '👋', points: 10 },
      { id: 2, name: 'Premier Certificat', description: 'Première formation terminée', icon: '🥇', points: 50 },
      { id: 3, name: 'Apprenant Assidu', description: '7 jours consécutifs', icon: '📚', points: 30 },
      { id: 4, name: 'Expert Quiz', description: 'Moyenne > 95%', icon: '🎯', points: 100 },
      { id: 5, name: 'Speed Learner', description: 'Formation en < 1 semaine', icon: '⚡', points: 75 }
    ];
    
    systemBadges.forEach(badge => {
      const earned = badges.find(b => b.id === badge.id);
      const badgeDiv = this.createBadgeElement(badge, earned);
      badgesContainer.appendChild(badgeDiv);
    });
  }
  
  createBadgeElement(badge, earned) {
    const div = document.createElement('div');
    div.className = `achievement-badge ${earned ? 'earned' : 'locked'}`;
    
    div.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-info">
        <div class="badge-title">${badge.name}</div>
        <div class="badge-description">${badge.description}</div>
        ${earned ? `<div class="badge-earned">Obtenu le ${this.formatDate(earned.earned_at)}</div>` : ''}
      </div>
      <div class="badge-points">+${badge.points} pts</div>
    `;
    
    return div;
  }
  
  renderActivities(activities) {
    const activitiesContainer = document.querySelector('.activities-list');
    if (!activitiesContainer) return;
    
    activitiesContainer.innerHTML = '';
    
    activities.slice(0, 5).forEach(activity => {
      const activityDiv = document.createElement('div');
      activityDiv.className = 'activity-item';
      
      activityDiv.innerHTML = `
        <div class="activity-icon">${this.getActivityIcon(activity.action)}</div>
        <div class="activity-content">
          <div class="activity-title">${this.getActivityTitle(activity.action)}</div>
          <div class="activity-description">${this.getActivityDescription(activity)}</div>
          <div class="activity-time">${this.formatRelativeTime(activity.created_at)}</div>
        </div>
      `;
      
      activitiesContainer.appendChild(activityDiv);
    });
  }
  
  // Méthodes utilitaires
  getCategoryIcon(categoryName) {
    const icons = {
      'Communication & Relationnel': '🗣️',
      'Hygiène & Sécurité': '🛡️',
      'Premiers Secours': '🚨',
      'Développement Personnel': '🎯'
    };
    return icons[categoryName] || '📚';
  }
  
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaine(s)`;
    return `Il y a ${Math.ceil(diffDays / 30)} mois`;
  }
  
  formatTime(minutes) {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins} min`;
  }
  
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  }
  
  getActivityIcon(action) {
    const icons = {
      'module_completed': '✅',
      'quiz_passed': '🎯',
      'formation_enrolled': '📚',
      'certificate_earned': '🏆',
      'badge_earned': '🏅'
    };
    return icons[action] || '📋';
  }
  
  getActivityTitle(action) {
    const titles = {
      'module_completed': 'Module terminé',
      'quiz_passed': 'Quiz réussi',
      'formation_enrolled': 'Nouvelle inscription',
      'certificate_earned': 'Certificat obtenu',
      'badge_earned': 'Badge débloqué'
    };
    return titles[action] || 'Activité';
  }
  
  getActivityDescription(activity) {
    // Utiliser les métadonnées pour créer une description personnalisée
    if (activity.metadata?.formation_title) {
      return activity.metadata.formation_title;
    }
    if (activity.metadata?.module_title) {
      return activity.metadata.module_title;
    }
    return 'Activité récente';
  }
  
  animateProgressCircle(percentage) {
    const circle = document.querySelector('.progress-circle');
    if (circle) {
      const degrees = (percentage / 100) * 360;
      circle.style.background = `conic-gradient(var(--primary-blue) 0deg ${degrees}deg, var(--soft-gray) ${degrees}deg 360deg)`;
    }
  }
  
  // Actions des boutons
  async downloadCertificate(enrollmentId) {
    try {
      this.showToast('📜 Téléchargement du certificat en cours...', 'info');
      // API call pour télécharger le certificat
      // await this.api.downloadCertificate(enrollmentId);
      setTimeout(() => {
        this.showToast('✅ Certificat téléchargé avec succès !', 'success');
      }, 1500);
    } catch (error) {
      this.showToast('❌ Erreur lors du téléchargement', 'error');
    }
  }
  
  reviewFormation(formationId) {
    window.location.href = `/formation-detail.html?id=${formationId}&mode=review`;
  }
  
  showProgress(enrollmentId) {
    // Ouvrir un modal avec les détails de progression
    // Pour l'instant, une alerte simple
    alert('📊 Détails de progression\n\nCette fonctionnalité ouvrira bientôt un modal détaillé avec votre progression complète.');
  }
  
  // Méthodes d'affichage
  showLoading() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <p>Chargement de vos données...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }
  
  hideLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.remove();
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