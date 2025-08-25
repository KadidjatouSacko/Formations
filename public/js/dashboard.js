// public/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Animation d'entrée
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200);
    });

    // Gestion des cartes de formation
    document.querySelectorAll('.formation-card').forEach(card => {
        const actionBtns = card.querySelectorAll('.btn');
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const btnText = btn.textContent.trim();
                const formationTitle = card.querySelector('.formation-title').textContent;
                
                if (btnText.includes('Continuer')) {
                    showToast('📚 Chargement du module...');
                } else if (btnText.includes('certificat')) {
                    downloadCertificate(formationTitle);
                } else if (btnText.includes('Revoir')) {
                    reviewFormation(formationTitle);
                }
            });
        });
    });

    // Statistiques animées
    animateStats();
    
    // Auto-refresh des données toutes les 30 secondes
    setInterval(refreshDashboardData, 30000);
});

// Fonction pour télécharger un certificat
function downloadCertificate(formationTitle) {
    showToast('📜 Téléchargement du certificat en cours...');
    
    // Simulation du téléchargement
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = `/api/certificates/download?formation=${encodeURIComponent(formationTitle)}`;
        link.download = `certificat-${formationTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('📜 Certificat téléchargé avec succès!');
    }, 1500);
}

// Fonction pour revoir une formation
function reviewFormation(formationTitle) {
    if (confirm(`🔄 Revoir la formation "${formationTitle}"\n\nVoulez-vous relancer cette formation terminée ?`)) {
        showToast('📚 Chargement de la formation...');
        setTimeout(() => {
            window.location.href = `/formations/review?course=${encodeURIComponent(formationTitle)}`;
        }, 1000);
    }
}

// Animation des statistiques
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue) || 0;
        
        if (numericValue > 0) {
            let currentValue = 0;
            const increment = numericValue / 30;
            
            const animation = setInterval(() => {
                currentValue += increment;
                if (currentValue >= numericValue) {
                    stat.textContent = finalValue;
                    clearInterval(animation);
                } else {
                    if (finalValue.includes('%')) {
                        stat.textContent = Math.floor(currentValue) + '%';
                    } else {
                        stat.textContent = Math.floor(currentValue);
                    }
                }
            }, 50);
        }
    });
}

// Rafraîchissement des données du dashboard
function refreshDashboardData() {
    fetch('/api/dashboard/refresh', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateDashboardStats(data.stats);
        }
    })
    .catch(error => {
        console.log('Erreur lors du rafraîchissement:', error);
    });
}

// Mise à jour des statistiques
function updateDashboardStats(newStats) {
    Object.keys(newStats).forEach(key => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) {
            element.textContent = newStats[key];
        }
    });
}

// Fonction utilitaire pour afficher des notifications
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 15px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}