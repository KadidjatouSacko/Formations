// public/js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.auth-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = this.querySelector('#email').value;
            const password = this.querySelector('#password').value;
            
            if (!email || !password) {
                e.preventDefault();
                showError('Veuillez remplir tous les champs');
                return;
            }
            
            if (!isValidEmail(email)) {
                e.preventDefault();
                showError('Veuillez entrer une adresse email valide');
                return;
            }
            
            // Afficher un loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳ Connexion...';
            submitBtn.disabled = true;
            
            // Le formulaire se soumet normalement
        });
    }
});

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(message) {
    const existingError = document.querySelector('.alert-error');
    if (existingError) {
        existingError.textContent = '❌ ' + message;
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = '❌ ' + message;
        
        const form = document.querySelector('.auth-form');
        form.parentNode.insertBefore(errorDiv, form);
    }
}
