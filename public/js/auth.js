// public/js/auth.js - Script pour l'authentification
class AuthManager {
  constructor() {
    this.api = window.FormProAPI;
    this.init();
  }
  
  init() {
    this.setupLoginForm();
    this.setupRegisterForm();
  }
  
  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;
      
      try {
        this.showLoading();
        await this.api.login(email, password);
        
        this.showToast('✅ Connexion réussie !', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
        
      } catch (error) {
        this.showToast(`❌ ${error.message}`, 'error');
      } finally {
        this.hideLoading();
      }
    });
  }
  
  showLoading() {
    const loader = document.createElement('div');
    loader.id = 'auth-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <p>Connexion en cours...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }
  
  hideLoading() {
    const loader = document.getElementById('auth-loader');
    if (loader) loader.remove();
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

// Styles CSS supplémentaires pour les nouvelles fonctionnalités
const dynamicStyles = `
<style>
/* Loader styles */
#page-loader, #auth-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.loader-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Toast notifications */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 15px;
  color: white;
  font-weight: 500;
  z-index: 10000;
  transform: translateX(400px);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.toast.show {
  transform: translateX(0);
}

.toast-success {
  background: var(--success);
}

.toast-error {
  background: var(--error);
}

.toast-info {
  background: var(--info);
}

.toast-warning {
  background: var(--warning);
}

/* No formations state */
.no-formations {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 2rem;
  background: var(--white);
  border-radius: 20px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

.no-formations-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-formations h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.no-formations p {
  color: var(--text-light);
  margin-bottom: 2rem;
}

/* Completed formations section */
.completed-formations {
  margin-top: 2rem;
}

.completed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
}

/* Video player styles */
.video-section {
  margin-bottom: 2rem;
}

.video-player {
  width: 100%;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.video-player video {
  width: 100%;
  height: auto;
  display: block;
}

.video-info h2 {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

/* Module actions */
.module-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
  padding: 2rem;
  background: var(--soft-gray);
  border-radius: 15px;
}

.module-actions .btn {
  padding: 0.8rem 2rem;
  font-weight: 500;
}

.module-actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Text content styles */
.text-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
}

.content-header {
  text-align: center;
  margin-bottom: 3rem;
}

.content-header h1 {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.content-description {
  color: var(--text-light);
  font-size: 1.1rem;
}

.content-body {
  font-size: 1.05rem;
  color: var(--text-dark);
}

.content-body h2, .content-body h3 {
  margin: 2rem 0 1rem;
  color: var(--text-dark);
}

.content-body p {
  margin-bottom: 1.5rem;
}

.content-body ul, .content-body ol {
  margin: 1.5rem 0;
  padding-left: 2rem;
}

.content-body li {
  margin-bottom: 0.5rem;
}

/* Resources section */
.resources-section {
  margin: 3rem 0;
  padding: 2rem;
  background: var(--light-blue);
  border-radius: 15px;
}

.resources-section h3 {
  color: var(--text-dark);
  margin-bottom: 1.5rem;
}

.downloads-grid {
  display: grid;
  gap: 1rem;
}

.download-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.download-icon {
  font-size: 2rem;
}

.download-info {
  flex: 1;
}

.download-title {
  font-weight: 600;
  color: var(--text-dark);
}

.download-meta {
  font-size: 0.9rem;
  color: var(--text-light);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .module-actions {
    flex-direction: column;
  }
  
  .toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    transform: translateY(-100px);
  }
  
  .toast.show {
    transform: translateY(0);
  }
  
  .downloads-grid {
    gap: 0.5rem;
  }
  
  .download-item {
    padding: 0.8rem;
  }
}
</style>
`;

// Injecter les styles dans la page
document.head.insertAdjacentHTML('beforeend', dynamicStyles);

// Initialisation de l'authentification si on est sur une page de connexion
if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
  window.auth = new AuthManager();
}1000);
        
      } catch (error) {
        this.showToast(`❌ ${error.message}`, 'error');
      } finally {
        this.hideLoading();
      }
    });
  }
  
  setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(registerForm);
      const userData = Object.fromEntries(formData.entries());
      
      try {
        this.showLoading();
        await this.api.register(userData);
        
        this.showToast('✅ Inscription réussie !', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 