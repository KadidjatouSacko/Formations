// ==================== MODELS/FORMATIONMODEL.JS (suite) ====================

// Quiz par module
export const getQuizByModule = async (moduleId) => {
    const quizzes = {
        4: {
            id: 4,
            moduleId: 4,
            title: "Communication avec les familles",
            description: "Évaluez vos connaissances sur la communication professionnelle",
            timeLimit: 10, // minutes
            passScore: 80,
            questions: [
                {
                    id: 1,
                    type: "multiple",
                    question: "Quel est le principe fondamental de la communication avec les familles ?",
                    options: [
                        "Donner toutes les informations d'un coup",
                        "Respecter la confidentialité et adapter son discours",
                        "Éviter de parler des difficultés",
                        "Communiquer uniquement par écrit"
                    ],
                    correctAnswer: 1,
                    explanation: "Il est essentiel de respecter la confidentialité tout en adaptant sa communication au niveau de compréhension de la famille."
                },
                {
                    id: 2,
                    type: "multiple",
                    question: "En cas de conflit dans l'équipe, quelle est la meilleure approche ?",
                    options: [
                        "Ignorer le conflit en espérant qu'il se résolve",
                        "Prendre parti pour l'une des personnes",
                        "Faciliter le dialogue et chercher une solution ensemble",
                        "Rapporter immédiatement à la direction"
                    ],
                    correctAnswer: 2,
                    explanation: "La médiation et la recherche de solutions collectives sont essentielles pour maintenir un bon climat de travail."
                }
                // ... autres questions
            ]
        }
    };
    
    return quizzes[moduleId] || null;
};

// Tentatives de quiz utilisateur
export const getUserQuizAttempts = async (userId, moduleId) => [
    {
        attempt: 1,
        date: "2024-08-25",
        score: 70,
        passed: false,
        timeSpent: "8min",
        answers: [1, 2, 0, 1, 3] // indices des réponses choisies
    }
];

// Soumission des réponses
export const submitQuizAnswers = async (userId, moduleId, answers, timeSpent) => {
    const quiz = await getQuizByModule(moduleId);
    if (!quiz) throw new Error('Quiz non trouvé');
    
    // Calcul du score
    let correctAnswers = 0;
    const feedback = [];
    
    quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        feedback.push({
            questionId: question.id,
            correct: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passScore;
    
    // Sauvegarde de la tentative
    const attempt = {
        userId,
        moduleId,
        score,
        passed,
        timeSpent,
        answers,
        date: new Date(),
        feedback
    };
    
    console.log('💾 Sauvegarde tentative quiz:', attempt);
    
    return {
        score,
        passed,
        feedback,
        correctAnswers,
        totalQuestions: quiz.questions.length
    };
};

// Module suivant
export const getNextModule = async (courseId, currentModuleId) => {
    const course = await getCourseById(courseId);
    const currentIndex = course.modules.findIndex(m => m.id == currentModuleId);
    
    if (currentIndex < course.modules.length - 1) {
        return course.modules[currentIndex + 1];
    }
    
    return null;
};

// Module précédent  
export const getPreviousModule = async (courseId, currentModuleId) => {
    const course = await getCourseById(courseId);
    const currentIndex = course.modules.findIndex(m => m.id == currentModuleId);
    
    if (currentIndex > 0) {
        return course.modules[currentIndex - 1];
    }
    
    return null;
};