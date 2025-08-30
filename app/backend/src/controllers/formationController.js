import * as formationModel from '../models/formationModel.js';

// Lecteur de formation
export const getLecteur = async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.session?.userId || 'demo-user';
    
    try {
        const course = await formationModel.getCourseById(courseId);
        const userProgress = await formationModel.getUserCourseProgress(userId, courseId);
        
        const data = {
            title: `${course.title} | FormaPro+`,
            course: course,
            modules: course.modules,
            userProgress: userProgress,
            currentModule: userProgress.currentModule || 1
        };
        res.render('formation/lecteur', data);
    } catch (error) {
        res.status(404).render('error', {
            title: 'Formation non trouvée',
            message: 'Cette formation n\'existe pas'
        });
    }
};

// Module spécifique
export const getModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const userId = req.session?.userId || 'demo-user';
    
    try {
        const moduleData = await formationModel.getModuleContent(courseId, moduleId);
        const progress = await formationModel.getModuleProgress(userId, courseId, moduleId);
        
        const data = {
            title: `${moduleData.title} | FormaPro+`,
            module: moduleData,
            course: await formationModel.getCourseById(courseId),
            progress: progress,
            nextModule: await formationModel.getNextModule(courseId, moduleId),
            prevModule: await formationModel.getPreviousModule(courseId, moduleId)
        };
        res.render('formation/module', data);
    } catch (error) {
        res.status(404).render('error', {
            title: 'Module non trouvé',
            message: 'Ce module n\'existe pas'
        });
    }
};

// Mise à jour progression formation
export const updateProgress = async (req, res) => {
    try {
        const userId = req.session?.userId || 'demo-user';
        const { courseId, moduleId, progress, timeSpent } = req.body;
        
        const result = await formationModel.updateProgress(userId, courseId, moduleId, progress, timeSpent);
        
        res.json({
            success: true,
            message: 'Progression sauvegardée',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la sauvegarde'
        });
    }
};

// Quiz
export const getQuiz = async (req, res) => {
    const moduleId = req.params.moduleId;
    const userId = req.session?.userId || 'demo-user';
    
    try {
        const quiz = await formationModel.getQuizByModule(moduleId);
        const userAttempts = await formationModel.getUserQuizAttempts(userId, moduleId);
        
        const data = {
            title: `Quiz - ${quiz.title} | FormaPro+`,
            quiz: quiz,
            attempts: userAttempts,
            canRetake: userAttempts.length < 3
        };
        res.render('formation/quiz', data);
    } catch (error) {
        res.status(404).render('error', {
            title: 'Quiz non trouvé',
            message: 'Ce quiz n\'existe pas'
        });
    }
};

// Soumission quiz
export const submitQuiz = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const userId = req.session?.userId || 'demo-user';
        const { answers, timeSpent } = req.body;
        
        const result = await formationModel.submitQuizAnswers(userId, moduleId, answers, timeSpent);
        
        res.json({
            success: true,
            score: result.score,
            passed: result.passed,
            feedback: result.feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission'
        });
    }
};
