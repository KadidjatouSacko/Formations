// public/js/auth.js - Script d'authentification complet
class AuthManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupDemoButtons();
    this.setupFormValidation();
  }
  
  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;
      
      if (!this.validateEmail(email)) {
        this.showToast('Veuillez entrer un email valide', 'error');
        return;
      }
      
      if (password.length < 6) {
        this.showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
      }
      
      this.showButtonLoading(submitBtn, 'Connexion...');
      
      // Le formulaire sera soumis normalement vers le serveur
      // En cas d'erreur, elle sera affichée par le template EJS
    });
  }
  
  setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const formData = new FormData(registerForm);
      const userData = Object.fromEntries(formData.entries());
      
      // Validation côté client
      if (!this.validateRegistration(userData)) {
        return;
      }
      
      this.showButtonLoading(submitBtn, 'Création du compte...');
      
      // Soumettre le formulaire normalement
      registerForm.submit();
    });
  }
  
  setupDemoButtons() {
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.email;
        const password = btn.dataset.password;
        
        if (email && password) {
          this.fillDemoCredentials(email, password);
        }
      });
    });
  }
  
  setupFormValidation() {
    // Validation en temps réel
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
    
    // Confirmation de mot de passe
    const confirmPassword = document.getElementById('confirm_password');
    const password = document.getElementById('password');
    
    if (confirmPassword && password) {
      confirmPassword.addEventListener('input', () => {
        if (confirmPassword.value !== password.value) {
          this.showFieldError(confirmPassword, 'Les mots de passe ne correspondent pas');
        } else {
          this.clearFieldError(confirmPassword);
        }
      });
    }
  }
  
  validateRegistration(userData) {
    let isValid = true;
    
    if (!userData.first_name || userData.first_name.length < 2) {
      this.showToast('Le prénom doit contenir au moins 2 caractères', 'error');
      isValid = false;
    }
    
    if (!userData.last_name || userData.last_name.length < 2) {
      this.showToast('Le nom doit contenir au moins 2 caractères', 'error');
      isValid = false;
    }
    
    if (!this.validateEmail(userData.email)) {
      this.showToast('Veuillez entrer un email valide', 'error');
      isValid = false;
    }
    
    if (!userData.password || userData.password.length < 8) {
      this.showToast('Le mot de passe doit contenir au moins 8 caractères', 'error');
      isValid = false;
    }
    
    if (userData.password !== userData.confirm_password) {
      this.showToast('Les mots de passe ne correspondent pas', 'error');
      isValid = false;
    }
    
    return isValid;
  }
  
  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    
    switch(input.type) {
      case 'email':
        if (!this.validateEmail(value)) {
          this.showFieldError(input, 'Email invalide');
          isValid = false;
        }
        break;
      case 'password':
        if (value.length < 8) {
          this.showFieldError(input, 'Au moins 8 caractères requis');
          isValid = false;
        }
        break;
      case 'text':
        if (input.required && value.length < 2) {
          this.showFieldError(input, 'Ce champ est requis');
          isValid = false;
        }
        break;
    }
    
    return isValid;
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  showFieldError(input, message) {
    this.clearFieldError(input);
    
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
  }
  
  clearFieldError(input) {
    input.classList.remove('error');
    const errorDiv = input.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }
  
  fillDemoCredentials(email, password) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = password;
      
      // Animation de remplissage
      [emailInput, passwordInput].forEach(input => {
        input.style.transform = 'scale(1.02)';
        input.style.borderColor = 'var(--primary)';
        setTimeout(() => {
          input.style.transform = '';
          input.style.borderColor = '';
        }, 300);
      });
      
      this.showToast('Compte de démonstration sélectionné', 'success', 2000);
    }
  }
  
  showButtonLoading(button, text) {
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.classList.add('loading');
    
    button.innerHTML = `
      <div class="btn-loading">
        <div class="spinner-btn"></div>
        ${text}
      </div>
    `;
    
    // Rétablir après 5 secondes (sécurité)
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove('loading');
      button.innerHTML = originalHTML;
    }, 5000);
  }
  
  showToast(message, type = 'info', duration = 4000) {
    // Supprimer les toasts existants
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
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
      <div class="toast-message">${message}</div>
      <button class="toast-close">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    // Event close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
    
    // Affichage animé
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-suppression
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Styles CSS pour l'authentification
const authStyles = `
<style>
/* Variables CSS pour l'auth */
:root {
  --primary: #667eea;
  --primary-dark: #5a67d8;
  --primary-light: #eef2ff;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --text-dark: #1e293b;
  --text-light: #64748b;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
}

/* Container d'authentification */
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
  z-index: 0;
}

/* Carte d'authentification */
.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.forma {
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.pro {
  font-weight: 600;
  font-size: 1.125rem;
  color: #f093fb;
  letter-spacing: 0.05em;
}

.auth-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  color: var(--text-light);
  font-size: 1.125rem;
  font-weight: 400;
}

/* Formulaires */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
  letter-spacing: 0.025em;
}

.form-icon {
  font-size: 1.125rem;
  color: var(--primary);
}

.form-input, .form-select {
  padding: 1rem 1.25rem;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: white;
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--text-light);
  font-weight: 400;
}

.form-input.error {
  border-color: var(--error);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.field-error {
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-error::before {
  content: '⚠️';
  font-size: 0.75rem;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spinner-btn {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.125rem;
}

/* Liens */
.auth-links {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-links p {
  margin-bottom: 1rem;
  color: var(--text-light);
  font-size: 1rem;
}

.link-primary {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.link-primary:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.link-secondary {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.link-secondary:hover {
  color: var(--text-dark);
}

/* Section démo */
.auth-demo {
  padding: 2rem;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  margin-top: 1.5rem;
}

.demo-title {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.demo-accounts {
  display: flex;
  gap: 1rem;
}

.demo-btn {
  flex: 1;
  padding: 1rem;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.demo-btn:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.demo-btn-icon {
  font-size: 1.5rem;
}

/* Alertes */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.alert-icon {
  font-size: 1.25rem;
}

/* Toast notifications */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 10000;
  transform: translateX(400px);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--gray-200);
  min-width: 300px;
  max-width: 400px;
}

.toast.show {
  transform: translateX(0);
}

.toast-success {
  border-left: 4px solid var(--success);
}

.toast-error {
  border-left: 4px solid var(--error);
}

.toast-warning {
  border-left: 4px solid var(--warning);
}

.toast-info {
  border-left: 4px solid var(--info);
}

.toast-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.toast-message {
  color: var(--text-dark);
  font-weight: 500;
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.toast-close:hover {
  background: var(--gray-200);
  color: var(--text-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 2rem 1.5rem;
    max-width: none;
  }
  
  .auth-title {
    font-size: 1.875rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .demo-accounts {
    flex-direction: column;
  }
  
  .toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
    transform: translateY(-100px);
  }
  
  .toast.show {
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem 1rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .logo-icon {
    width: 48px;
    height: 48px;
  }
  
  .forma {
    font-size: 1.25rem;
  }
}
</style>
`;

// Injection des styles
document.head.insertAdjacentHTML('beforeend', authStyles);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.auth-container')) {
    new AuthManager();
  }
});

// Export pour utilisation globale
window.AuthManager = AuthManager;