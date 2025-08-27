// public/js/api.js - Service API central
class FormProAPI {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('formapro_token');
  }
  
  // Headers par défaut
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }
  
  // Méthode générique pour les requêtes
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }
  
  // Authentification
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('formapro_token', data.token);
      localStorage.setItem('formapro_user', JSON.stringify(data.user));
    }
    
    return data;
  }
  
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('formapro_token', data.token);
      localStorage.setItem('formapro_user', JSON.stringify(data.user));
    }
    
    return data;
  }
  
  logout() {
    this.token = null;
    localStorage.removeItem('formapro_token');
    localStorage.removeItem('formapro_user');
    window.location.href = '/login.html';
  }
  
  // Dashboard
  async getDashboard(userId) {
    return await this.request(`/dashboard/student/${userId}`);
  }
  
  async getActivity(userId) {
    return await this.request(`/dashboard/activity/${userId}`);
  }
  
  // Formations
  async getFormations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/formations?${queryString}`);
  }
  
  async getFormation(id) {
    return await this.request(`/formations/${id}`);
  }
  
  // Inscriptions
  async enrollInFormation(formationId) {
    return await this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ formation_id: formationId })
    });
  }
  
  async updateModuleProgress(enrollmentId, moduleId, progressData) {
    return await this.request(`/enrollments/${enrollmentId}/progress/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData)
    });
  }
  
  // Utilisateur connecté
  getCurrentUser() {
    const userData = localStorage.getItem('formapro_user');
    return userData ? JSON.parse(userData) : null;
  }
  
  isAuthenticated() {
    return !!this.token && !!this.getCurrentUser();
  }
}

// Instance globale
window.FormProAPI = new FormProAPI();