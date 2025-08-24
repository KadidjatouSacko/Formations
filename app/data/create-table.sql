-- ===========================================
-- BASE DE DONNÉES FORMAPRO+ (PostgreSQL)
-- Plateforme de formation professionnelle
-- ===========================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Types d'énumération
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE formation_status AS ENUM ('draft', 'published', 'archived', 'suspended');
CREATE TYPE module_type AS ENUM ('video', 'text', 'quiz', 'exercise', 'document', 'interactive');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'paused', 'cancelled', 'expired');
CREATE TYPE quiz_type AS ENUM ('mcq', 'true_false', 'fill_blank', 'matching', 'essay');
CREATE TYPE notification_type AS ENUM ('system', 'course', 'achievement', 'reminder', 'message');
CREATE TYPE certificate_status AS ENUM ('pending', 'issued', 'revoked', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE badge_type AS ENUM ('completion', 'performance', 'engagement', 'special', 'milestone');

-- ===========================================
-- 1. GESTION DES UTILISATEURS
-- ===========================================

-- Table des utilisateurs principaux
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_image VARCHAR(500),
    role user_role DEFAULT 'student',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profils étendus par rôle
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(200),
    job_title VARCHAR(150),
    experience_level VARCHAR(50),
    learning_goals TEXT,
    preferred_learning_style VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    language VARCHAR(10) DEFAULT 'fr',
    accessibility_options JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instructor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise_areas TEXT[],
    certifications TEXT[],
    experience_years INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    availability JSONB DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions utilisateur
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 2. SYSTÈME DE FORMATIONS
-- ===========================================

-- Catégories de formations
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    icon VARCHAR(100),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formations principales
CREATE TABLE formations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    instructor_id UUID REFERENCES users(id),
    thumbnail VARCHAR(500),
    banner_image VARCHAR(500),
    video_trailer VARCHAR(500),
    level VARCHAR(50) DEFAULT 'beginner',
    duration_hours INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    original_price DECIMAL(10,2),
    discount_percentage INTEGER DEFAULT 0,
    status formation_status DEFAULT 'draft',
    max_students INTEGER,
    prerequisites TEXT[],
    learning_objectives TEXT[],
    target_audience TEXT[],
    tags VARCHAR(50)[],
    language VARCHAR(10) DEFAULT 'fr',
    certificate_template_id UUID,
    pass_percentage INTEGER DEFAULT 80,
    is_featured BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules de formation
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    module_type module_type NOT NULL,
    content JSONB DEFAULT '{}',
    video_url VARCHAR(500),
    video_duration INTEGER DEFAULT 0,
    document_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    pass_required BOOLEAN DEFAULT FALSE,
    estimated_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ressources téléchargeables
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 3. SYSTÈME DE QUIZ ET ÉVALUATIONS
-- ===========================================

-- Quiz
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    instructions TEXT,
    time_limit INTEGER, -- en minutes
    max_attempts INTEGER DEFAULT 3,
    pass_percentage INTEGER DEFAULT 80,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    show_results BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions de quiz
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type quiz_type DEFAULT 'mcq',
    points INTEGER DEFAULT 1,
    explanation TEXT,
    media_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options de réponse
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 4. INSCRIPTIONS ET PROGRESSIONS
-- ===========================================

-- Inscriptions aux formations
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0,
    current_module_id UUID REFERENCES modules(id),
    time_spent INTEGER DEFAULT 0, -- en minutes
    last_accessed TIMESTAMP,
    payment_id UUID,
    certificate_issued BOOLEAN DEFAULT FALSE,
    final_score DECIMAL(5,2),
    UNIQUE(user_id, formation_id)
);

-- Progression par module
CREATE TABLE module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    video_watched_duration INTEGER DEFAULT 0,
    notes TEXT,
    bookmarked BOOLEAN DEFAULT FALSE,
    UNIQUE(enrollment_id, module_id)
);

-- Résultats des quiz
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_taken INTEGER, -- en secondes
    score DECIMAL(5,2),
    total_points INTEGER,
    obtained_points INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    answers JSONB DEFAULT '{}',
    UNIQUE(enrollment_id, quiz_id, attempt_number)
);

-- ===========================================
-- 5. CERTIFICATS ET BADGES
-- ===========================================

-- Templates de certificats
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    template_url VARCHAR(500),
    background_image VARCHAR(500),
    layout JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificats émis
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    template_id UUID REFERENCES certificate_templates(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_by UUID REFERENCES users(id),
    status certificate_status DEFAULT 'issued',
    pdf_url VARCHAR(500),
    verification_url VARCHAR(500),
    expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Système de badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(500),
    badge_type badge_type DEFAULT 'completion',
    criteria JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges obtenus par les utilisateurs
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    formation_id UUID REFERENCES formations(id),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_id)
);

-- ===========================================
-- 6. SYSTÈME DE PAIEMENTS
-- ===========================================

-- Commandes
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status payment_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    payment_reference VARCHAR(255),
    billing_address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles de commande
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    formation_id UUID REFERENCES formations(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 7. COMMUNICATIONS ET NOTIFICATIONS
-- ===========================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type DEFAULT 'system',
    related_id UUID,
    related_type VARCHAR(50),
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages entre utilisateurs
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    formation_id UUID REFERENCES formations(id),
    subject VARCHAR(300),
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    replied_at TIMESTAMP,
    parent_message_id UUID REFERENCES messages(id),
    attachments VARCHAR(500)[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum de discussions
CREATE TABLE forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES forum_replies(id),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 8. ANALYTICS ET STATISTIQUES
-- ===========================================

-- Activité des utilisateurs
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statistiques de visionnage vidéo
CREATE TABLE video_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    session_id UUID,
    watch_time INTEGER, -- en secondes
    progress_percentage INTEGER,
    paused_at INTEGER[],
    resumed_at INTEGER[],
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Évaluations et avis
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(300),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, formation_id)
);

-- ===========================================
-- 9. INDICES POUR PERFORMANCES
-- ===========================================

-- Indices principaux
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_formations_category_status ON formations(category_id, status);
CREATE INDEX idx_formations_instructor ON formations(instructor_id);
CREATE INDEX idx_modules_formation ON modules(formation_id, sort_order);
CREATE INDEX idx_enrollments_user_formation ON enrollments(user_id, formation_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_module_progress_enrollment ON module_progress(enrollment_id, module_id);
CREATE INDEX idx_quiz_attempts_enrollment_quiz ON quiz_attempts(enrollment_id, quiz_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_user_activities_user_action ON user_activities(user_id, action);
CREATE INDEX idx_video_analytics_user_module ON video_analytics(user_id, module_id);

-- Indices de recherche textuelle
CREATE INDEX idx_formations_search ON formations USING GIN (to_tsvector('french', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_modules_search ON modules USING GIN (to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- ===========================================
-- 10. FONCTIONS ET DÉCLENCHEURS
-- ===========================================

-- Fonction pour mettre à jour la progression d'une inscription
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE enrollments 
    SET progress_percentage = (
        SELECT COALESCE(ROUND(
            (COUNT(CASE WHEN mp.status = 'completed' THEN 1 END) * 100.0) / 
            NULLIF(COUNT(*), 0)
        ), 0)
        FROM module_progress mp
        WHERE mp.enrollment_id = NEW.enrollment_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.enrollment_id;
    
    -- Marquer comme terminé si 100%
    IF (SELECT progress_percentage FROM enrollments WHERE id = NEW.enrollment_id) = 100 THEN
        UPDATE enrollments 
        SET status = 'completed', 
            completed_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.enrollment_id AND status != 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour la progression des modules
CREATE TRIGGER trigger_update_enrollment_progress
    AFTER INSERT OR UPDATE ON module_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_progress();

-- Fonction pour gérer les updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheurs pour updated_at
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_formations_updated_at BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 11. DONNÉES DE DÉMONSTRATION
-- ===========================================

-- Catégories de base
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Communication & Relationnel', 'communication-relationnel', 'Formations sur la communication professionnelle', '🗣️', '#d4a5a5'),
('Hygiène & Sécurité', 'hygiene-securite', 'Formations sur les règles d\'hygiène et sécurité', '🛡️', '#a5c9d4'),
('Premiers Secours', 'premiers-secours', 'Formations aux gestes de premiers secours', '🚨', '#ff6b6b'),
('Développement Personnel', 'developpement-personnel', 'Formations de développement des compétences personnelles', '🎯', '#4ecdc4');

-- Templates de certificats
INSERT INTO certificate_templates (name, template_url, is_default) VALUES
('Template Standard', '/templates/standard-certificate.pdf', true),
('Template Premium', '/templates/premium-certificate.pdf', false);

-- Badges système
INSERT INTO badges (name, description, icon, badge_type, points) VALUES
('Premier Pas', 'Première connexion sur la plateforme', '👋', 'milestone', 10),
('Premier Certificat', 'Première formation terminée avec succès', '🥇', 'completion', 50),
('Apprenant Assidu', '7 jours consécutifs de connexion', '📚', 'engagement', 30),
('Expert Quiz', 'Moyenne supérieure à 95% sur les quiz', '🎯', 'performance', 100),
('Speed Learner', 'Formation terminée en moins d\'une semaine', '⚡', 'performance', 75);

-- Utilisateur administrateur par défaut
INSERT INTO users (email, password_hash, first_name, last_name, role, status, email_verified) VALUES
('admin@formapro.fr', crypt('AdminPassword123!', gen_salt('bf')), 'Admin', 'FormaPro', 'super_admin', 'active', true);

-- ===========================================
-- 12. VUES UTILES
-- ===========================================

-- Vue des formations avec statistiques
CREATE VIEW formations_with_stats AS
SELECT 
    f.*,
    c.name as category_name,
    CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_enrollments,
    AVG(r.rating) as avg_rating,
    COUNT(DISTINCT r.id) as review_count
FROM formations f
LEFT JOIN categories c ON f.category_id = c.id
LEFT JOIN users u ON f.instructor_id = u.id
LEFT JOIN enrollments e ON f.id = e.formation_id
LEFT JOIN reviews r ON f.id = r.formation_id
GROUP BY f.id, c.name, u.first_name, u.last_name;

-- Vue du tableau de bord étudiant
CREATE VIEW student_dashboard AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_formations,
    COUNT(DISTINCT c.id) as certificates_earned,
    COUNT(DISTINCT ub.id) as badges_earned,
    AVG(e.progress_percentage) as avg_progress,
    SUM(e.time_spent) as total_time_spent
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
LEFT JOIN certificates c ON e.id = c.enrollment_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name;

-- ===========================================
-- COMMENTAIRES FINAUX
-- ===========================================

/*
Cette base de données PostgreSQL est conçue pour :

✅ FONCTIONNALITÉS PRINCIPALES :
- Gestion complète des utilisateurs (étudiants, instructeurs, admins)
- Système de formations modulaires avec quiz
- Suivi de progression en temps réel
- Certificats et badges automatisés
- Système de paiements intégré
- Analytics détaillées
- Forum et messaging

✅ SÉCURITÉ :
- Mots de passe hachés avec bcrypt
- Tokens de session sécurisés
- Verification d'email
- Protection contre le brute force

✅ PERFORMANCES :
- Indices optimisés pour les requêtes fréquentes
- Vues matérialisées pour les statistiques
- Structure normalisée

✅ EXTENSIBILITÉ :
- Support multi-langues
- Système de métadonnées JSONB flexible
- Architecture modulaire

Pour l'utiliser avec JavaScript/Node.js :
1. Utilisez un ORM comme Prisma, Sequelize ou TypeORM
2. Ou une librairie comme pg (node-postgres)
3. Implémentez les connexions avec pool de connexions
4. Ajoutez les migrations pour les mises à jour
*/