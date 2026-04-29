// js/main.js
import { getPublicQuizzes } from './firebase-db.js';

let allQuizzes = []; // Store the fetched quizzes in memory for fast searching

document.addEventListener('DOMContentLoaded', async () => {
    const quizGrid = document.getElementById('quizGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');

    // 1. Fetch and render initial data
    try {
        allQuizzes = await getPublicQuizzes();
        loadingIndicator.style.display = 'none'; // Hide loading state
        renderQuizzes(allQuizzes);
    } catch (error) {
        loadingIndicator.textContent = 'Error loading quizzes. Please try again later.';
        loadingIndicator.style.color = 'red';
    }

    // 2. Real-time search filter
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        const filteredQuizzes = allQuizzes.filter(quiz => {
            const title = quiz.title ? quiz.title.toLowerCase() : '';
            return title.includes(searchTerm);
        });
        
        renderQuizzes(filteredQuizzes);
    });

    // 3. Render logic
    function renderQuizzes(quizzesToRender) {
        quizGrid.innerHTML = ''; // Clear current grid

        if (quizzesToRender.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            quizzesToRender.forEach(quiz => {
                const card = createQuizCard(quiz);
                quizGrid.appendChild(card);
            });
        }
    }

    // 4. Card construction
    function createQuizCard(quiz) {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.style.cursor = 'pointer'; // Visual feedback that it's clickable
        
        // Redirect to quiz.html with the document ID in the URL params
        card.addEventListener('click', () => {
            window.location.href = `quiz.html?id=${quiz.id}`;
        });

        // Safely determine the number of questions depending on your DB schema
        const questionCount = quiz.questions 
            ? quiz.questions.length 
            : (quiz.questionCount || 0);

        card.innerHTML = `
            <h3>${quiz.title || 'Untitled Quiz'}</h3>
            <p>${quiz.description || 'No description provided.'}</p>
            <div class="card-meta">
                <span><strong>Questions:</strong> ${questionCount}</span>
                <br>
                <span><strong>Author:</strong> ${quiz.createdBy || 'Anonymous'}</span>
            </div>
        `;

        return card;
    }
});
