// public/js/lecteur.js
document.addEventListener('DOMContentLoaded', function() {
    let moduleCompleted = false;
    let videoWatched = false;
    let quizCompleted = false;
    
    const videoPlayer = document.querySelector('.video-player');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const readingProgress = document.getElementById('readingProgress');
    
    // Gestion de la vidéo
    if (videoPlayer) {
        videoPlayer.addEventListener('loadedmetadata', function() {
            updateReadingProgress(25); // Vidéo chargée = 25%
        });
        
        videoPlayer.addEventListener('timeupdate', function() {
            const progress = (videoPlayer.currentTime / videoPlayer.duration) * 50;
            updateReadingProgress(25 + progress);
            
            // Marquer comme regardée à 80%
            if (videoPlayer.currentTime / videoPlayer.duration > 0.8 && !videoWatched) {
                videoWatched = true;
                showToast('✅ Vidéo terminée ! Vous pouvez maintenant passer au quiz.');
                enableQuiz();
            }
        });
    }
    
    // Gestion du quiz
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            if (!videoWatched) {
                showToast('⚠️ Veuillez d\'abord terminer la vidéo');
                return;
            }
            startQuiz();
        });
    }
    
    // Gestion du scroll pour la progression
    window.addEventListener('scroll', updateScrollProgress);
    
    // Navigation entre modules
    setupModuleNavigation();
    
    // Sauvegarde automatique de la progression
    setInterval(saveProgress, 30000);
});

// Mise à jour de la progression de lecture
function updateReadingProgress(percentage) {
    const progressBar = document.getElementById('readingProgress');
    if (progressBar) {
        progressBar.style.width = Math.min(percentage, 100) + '%';
    }
}

// Mise à jour basée sur le scroll
function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 25; // Scroll = 25% max
    
    updateReadingProgress(25 + scrollPercent);
}

// Activation du quiz
function enableQuiz() {
    const startQuizBtn = document.getElementById('startQuizBtn');
    if (startQuizBtn) {
        startQuizBtn.disabled = false;
        startQuizBtn.classList.add('enabled');
    }
}

// Démarrage du quiz
function startQuiz() {
    showQuizModal();
}

// Affichage de la modal de quiz
function showQuizModal() {
    const modal = document.createElement('div');
    modal.className = 'quiz-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>🎯 Quiz de validation</h2>
                <p>Vous allez commencer le quiz de validation du module.</p>
                <div class="quiz-info">
                    <div><strong>📝</strong> 15 questions</div>
                    <div><strong>⏰</strong> 10 minutes</div>
                    <div><strong>🎯</strong> 80% requis</div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="startQuizProcess()">Commencer</button>
                    <button class="btn btn-outline" onclick="closeQuizModal()">Annuler</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Processus de quiz
function startQuizProcess() {
    closeQuizModal();
    
    let currentQuestion = 1;
    const totalQuestions = 15;
    let score = 0;
    
    const quizInterval = setInterval(() => {
        if (currentQuestion <= totalQuestions) {
            // Simulation d'une bonne réponse (85% de chance)
            const isCorrect = Math.random() > 0.15;
            if (isCorrect) score++;
            
            showToast(`📝 Question ${currentQuestion}/${totalQuestions} - ${isCorrect ? 'Bonne réponse!' : 'Dommage...'}`);
            
            // Mise à jour de la progression
            const progress = 75 + (currentQuestion / totalQuestions) * 25;
            updateReadingProgress(progress);
            
            currentQuestion++;
        } else {
            clearInterval(quizInterval);
            completeQuiz(score, totalQuestions);
        }
    }, 2000);
}

// Complétion du quiz
function completeQuiz(score, total) {
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 80;
    
    updateReadingProgress(100);
    
    setTimeout(() => {
        if (passed) {
            showCompletionModal(percentage);
            moduleCompleted = true;
            unlockNextModule();
        } else {
            showRetryModal(percentage);
        }
    }, 1000);
}

// Modal de complétion
function showCompletionModal(score) {
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content success">
                <div class="success-icon">🎉</div>
                <h2>Module terminé !</h2>
                <p>Félicitations ! Vous avez terminé ce module avec succès.</p>
                <div class="score-display">
                    <strong>Score final : ${score}%</strong>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="goToNextModule()">Module suivant</button>
                    <button class="btn btn-outline" onclick="backToDashboard()">Retour au dashboard</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Sauvegarde de la progression
function saveProgress() {
    const progressData = {
        moduleId: getCurrentModuleId(),
        progress: getCurrentProgress(),
        videoWatched: videoWatched,
        quizCompleted: quizCompleted,
        timestamp: new Date().toISOString()
    };
    
    fetch('/api/progress/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
    })
    .catch(error => console.log('Erreur sauvegarde:', error));
}

// Fonctions utilitaires
function getCurrentModuleId() {
    const url = new URL(window.location);
    return url.pathname.split('/').pop();
}

function getCurrentProgress() {
    const progressBar = document.getElementById('readingProgress');
    return progressBar ? parseFloat(progressBar.style.width) : 0;
}

function closeQuizModal() {
    const modal = document.querySelector('.quiz-modal');
    if (modal) modal.remove();
}

function goToNextModule() {
    showToast('➡️ Passage au module suivant...');
    setTimeout(() => {
        window.location.href = getNextModuleUrl();
    }, 1000);
}

function backToDashboard() {
    window.location.href = '/dashboard';
}

function getNextModuleUrl() {
    const currentUrl = new URL(window.location);
    const pathParts = currentUrl.pathname.split('/');
    const currentModule = parseInt(pathParts[pathParts.length - 1]);
    pathParts[pathParts.length - 1] = currentModule + 1;
    return pathParts.join('/');
}

function unlockNextModule() {
    // Logique pour débloquer le module suivant
    const nextModule = document.querySelector('.module-item.locked');
    if (nextModule) {
        nextModule.classList.remove('locked');
        nextModule.classList.add('available');
    }
}