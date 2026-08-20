// Central App Controller for SQL Theory Guide

const SITE_MAP = [
    { name: "Module 1: SQL Subsets", file: "index.html" },
    { name: "Module 2: The JOIN Zoology", file: "module2.html" },
    { name: "Module 3: Subqueries & Correlated Logic", file: "module3.html" },
    { name: "Module 4: Window Functions & Analytics", file: "module4.html" },
    { name: "Module 5: DBMS Architecture & Indexing", file: "module5.html" },
    { name: "Module 6: Query Tuning & Optimizers", file: "module6.html" },
    { name: "Module 7: SQL Query Interview Zoo", file: "module7.html" },
    { name: "Module 8: Interactive SQL Practical Lab", file: "module8.html" },
    { name: "Quick-Review Summary Matrix", file: "summary_matrix.html" }
];

// Determine current page filename safely
const getCurrentFilename = () => {
    const path = window.location.pathname;
    const name = path.substring(path.lastIndexOf('/') + 1);
    return name || "index.html";
};

// Clipboard copy helper
function copyTextToClipboard(text, successCallback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(successCallback).catch(err => {
            fallbackCopyTextToClipboard(text, successCallback);
        });
    } else {
        fallbackCopyTextToClipboard(text, successCallback);
    }
}

function fallbackCopyTextToClipboard(text, successCallback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) successCallback();
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
}

// --------------------------------------------------
//            TOC Builder & Sidebar Engine
// --------------------------------------------------
const renderSidebar = () => {
    const tocNav = document.getElementById('toc-nav');
    if (!tocNav) return;
    tocNav.innerHTML = '';
    
    const currentFile = getCurrentFilename();
    
    SITE_MAP.forEach((mod) => {
        const modGroup = document.createElement('div');
        modGroup.className = 'toc-module-group';
        
        const modLink = document.createElement('a');
        modLink.className = 'toc-link toc-module-link';
        modLink.href = mod.file;
        modLink.textContent = mod.name;
        
        // Highlight active sidebar module
        const isCurrent = (mod.file === currentFile);
        if (isCurrent) {
            modLink.classList.add('active');
        }
        
        modGroup.appendChild(modLink);
        
        // If current page, scan DOM topics to insert dynamic sub-navigation
        if (isCurrent) {
            const topicList = document.createElement('ul');
            topicList.className = 'toc-topic-list';
            
            const topicCards = document.querySelectorAll('.topic-card');
            topicCards.forEach((card, idx) => {
                const headingEl = card.querySelector('.topic-heading');
                const numEl = card.querySelector('.topic-num');
                const text = headingEl ? headingEl.textContent : `Topic ${idx + 1}`;
                const num = numEl ? numEl.textContent : `${idx + 1}.`;
                
                const topicId = `topic-${idx + 1}`;
                card.id = topicId;
                
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.className = 'toc-link toc-topic-link';
                link.href = `#${topicId}`;
                link.innerHTML = `<span class="toc-topic-num">${num}</span> ${text}`;
                
                li.appendChild(link);
                topicList.appendChild(li);
            });
            
            modGroup.appendChild(topicList);
        }
        
        tocNav.appendChild(modGroup);
    });
};

// --------------------------------------------------
//              TOC ScrollSpy Engine
// --------------------------------------------------
const initScrollSpy = () => {
    const topicCards = document.querySelectorAll('.topic-card');
    if (topicCards.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-85px 0px -75% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.toc-topic-link').forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    topicCards.forEach(elem => observer.observe(elem));
};

// --------------------------------------------------
//              Live Search Filtering
// --------------------------------------------------
const initSearch = () => {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.topic-card, table, .quiz-card');
        
        cards.forEach(card => {
            if (query === '') {
                card.style.display = '';
                return;
            }
            
            if (card.classList.contains('quiz-card')) {
                card.style.display = 'none';
                return;
            }
            
            const text = card.textContent.toLowerCase();
            if (text.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Hide/show links in TOC based on content visibility
        document.querySelectorAll('.toc-topic-link').forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            const targetElem = document.getElementById(targetId);
            if (targetElem && targetElem.style.display === 'none') {
                link.parentElement.style.display = 'none';
            } else {
                link.parentElement.style.display = '';
            }
        });
    });
};

// --------------------------------------------------
//            Dynamic Copy-Code Buttons
// --------------------------------------------------
const initCopyButtons = () => {
    document.querySelectorAll('pre').forEach(pre => {
        // Skip if pre already wrapped or has copy button
        if (pre.parentNode.classList.contains('code-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const btn = document.createElement('button');
        btn.className = 'copy-code-btn';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        btn.title = "Copy Code";

        btn.addEventListener('click', () => {
            const code = pre.textContent || pre.innerText;
            copyTextToClipboard(code, () => {
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                    btn.classList.remove('copied');
                }, 2000);
            });
        });

        wrapper.appendChild(btn);
    });
};

// --------------------------------------------------
//         Core Quiz Manager Controller
// --------------------------------------------------
const QuizManager = {
    state: {
        currentIdx: 0,
        score: 0,
        answers: [],
        completed: false,
        reviewMode: false
    },
    
    init() {
        if (!window.QUIZ_QUESTIONS || window.QUIZ_QUESTIONS.length === 0) return;
        
        const topicCards = document.querySelectorAll('.topic-card');
        if (topicCards.length === 0) return;
        
        const lastCard = topicCards[topicCards.length - 1];
        
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.id = 'quiz-card-main';
        
        lastCard.parentNode.insertBefore(quizCard, lastCard.nextSibling);
        this.renderStartScreen();
    },
    
    renderStartScreen() {
        const card = document.getElementById('quiz-card-main');
        if (!card) return;
        
        card.innerHTML = `
            <div class="quiz-header">
                <div class="quiz-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></svg>
                    Module Quiz
                </div>
                <div class="quiz-badge">Static Quiz</div>
            </div>
            <div class="quiz-results-container">
                <div class="quiz-results-message">Test your module knowledge!</div>
                <div class="quiz-results-feedback">
                    This interactive quiz contains ${window.QUIZ_QUESTIONS.length} multiple-choice questions matching this module's topics. Perfect for placement prep!
                </div>
                <button class="quiz-btn" style="margin: 0 auto;" onclick="QuizManager.startQuiz()">
                    Start Quiz
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        `;
    },
    
    startQuiz() {
        this.state = {
            currentIdx: 0,
            score: 0,
            answers: [],
            completed: false,
            reviewMode: false
        };
        this.renderQuestion();
    },
    
    renderQuestion() {
        const card = document.getElementById('quiz-card-main');
        const q = window.QUIZ_QUESTIONS[this.state.currentIdx];
        
        const userAns = this.state.answers[this.state.currentIdx];
        const isAnswered = userAns !== undefined;
        
        let optionsHtml = '';
        q.options.forEach((opt, idx) => {
            let stateClass = '';
            if (isAnswered) {
                if (idx === q.correct) {
                    stateClass = 'correct';
                } else if (idx === userAns) {
                    stateClass = 'incorrect';
                } else {
                    stateClass = 'disabled';
                }
            }
            
            optionsHtml += `
                <div class="quiz-option ${stateClass} ${!isAnswered ? '' : 'no-hover'}" 
                     ${!isAnswered ? `onclick="QuizManager.selectOption(${idx})"` : ''}>
                    <div class="quiz-option-letter">${String.fromCharCode(65 + idx)}</div>
                    <div class="quiz-option-text">${opt}</div>
                </div>
            `;
        });
        
        const isFirst = this.state.currentIdx === 0;
        const progress = Math.round(((this.state.currentIdx + 1) / window.QUIZ_QUESTIONS.length) * 100);
        
        let explanationHtml = '';
        if (isAnswered) {
            const isCorrect = userAns === q.correct;
            explanationHtml = `
                <div class="quiz-explanation-box" style="display: block; margin-top: 1rem;">
                    <strong>${isCorrect ? 'Correct! ✓' : 'Incorrect ✗'}</strong>
                    <p style="margin-top: 0.25rem;">${q.explanation}</p>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="quiz-header">
                <div class="quiz-title">Question ${this.state.currentIdx + 1} of ${window.QUIZ_QUESTIONS.length}</div>
                <div class="quiz-badge">In Progress</div>
            </div>
            
            <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" style="width: ${progress}%;"></div>
            </div>
            
            <div class="quiz-question">${q.question}</div>
            
            <div class="quiz-options-container">${optionsHtml}</div>
            
            ${explanationHtml}
            
            <div class="quiz-action-bar" style="margin-top: 1.25rem;">
                <button class="quiz-btn quiz-btn-secondary" onclick="QuizManager.prevQuestion()" ${isFirst ? 'disabled' : ''}>
                    Previous
                </button>
                <button class="quiz-btn" id="quiz-next-btn" onclick="QuizManager.nextQuestion()" ${isAnswered ? '' : 'disabled'}>
                    ${this.state.currentIdx === window.QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        `;
    },
    
    selectOption(optIdx) {
        this.state.answers[this.state.currentIdx] = optIdx;
        this.renderQuestion();
    },
    
    prevQuestion() {
        if (this.state.currentIdx > 0) {
            this.state.currentIdx--;
            this.renderQuestion();
        }
    },
    
    nextQuestion() {
        if (this.state.currentIdx < window.QUIZ_QUESTIONS.length - 1) {
            this.state.currentIdx++;
            this.renderQuestion();
        } else {
            this.state.completed = true;
            this.state.score = this.state.answers.reduce((acc, ans, idx) => {
                return acc + (ans === window.QUIZ_QUESTIONS[idx].correct ? 1 : 0);
            }, 0);
            this.renderResults();
        }
    },
    
    renderResults() {
        const card = document.getElementById('quiz-card-main');
        const scorePct = Math.round((this.state.score / window.QUIZ_QUESTIONS.length) * 100);
        
        let feedbackMessage = '';
        let feedbackSub = '';
        if (scorePct >= 90) {
            feedbackMessage = 'SQL Master! 👑';
            feedbackSub = 'Excellent performance! You have achieved absolute mastery over these concepts. You are ready to crack top-tier placement interviews!';
        } else if (scorePct >= 70) {
            feedbackMessage = 'Strong Performance! 🚀';
            feedbackSub = 'Great job! You have a solid grasp of the core concepts in this module. Just a little more practice and you will be perfect!';
        } else {
            feedbackMessage = 'Keep Practicing! 📚';
            feedbackSub = 'A good attempt! Re-read the module materials, check the explanations for the questions you missed, and try again.';
        }
        
        card.innerHTML = `
            <div class="quiz-header">
                <div class="quiz-title">Quiz Results</div>
                <div class="quiz-badge">Completed</div>
            </div>
            
            <div class="quiz-results-container">
                <div class="quiz-results-message">${feedbackMessage}</div>
                <div class="quiz-results-score">${this.state.score} / ${window.QUIZ_QUESTIONS.length}</div>
                <div class="quiz-results-feedback">${feedbackSub}</div>
                
                <div class="quiz-action-bar" style="justify-content: center; margin-top: 1.5rem;">
                    <button class="quiz-btn quiz-btn-secondary" onclick="QuizManager.startQuiz()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></svg>
                        Retake Quiz
                    </button>
                    <button class="quiz-btn" onclick="QuizManager.toggleReviewMode()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        Review Answers
                    </button>
                </div>
                
                <div id="quiz-review-container"></div>
            </div>
        `;
    },
    
    toggleReviewMode() {
        const reviewContainer = document.getElementById('quiz-review-container');
        if (!reviewContainer) return;
        
        if (reviewContainer.innerHTML !== '') {
            reviewContainer.innerHTML = '';
            return;
        }
        
        let reviewHtml = '<div class="quiz-review-list">';
        window.QUIZ_QUESTIONS.forEach((q, idx) => {
            const userAnsIdx = this.state.answers[idx];
            const isCorrect = userAnsIdx === q.correct;
            
            const userAnsText = userAnsIdx !== undefined ? q.options[userAnsIdx] : 'None selected';
            const correctAnsText = q.options[q.correct];
            
            reviewHtml += `
                <div class="quiz-review-item">
                    <div class="quiz-review-question">${idx + 1}. ${q.question}</div>
                    <span class="quiz-review-status ${isCorrect ? 'correct-status' : 'incorrect-status'}">
                        ${isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <div class="quiz-review-answer-line">
                        <strong>Your Answer:</strong> <span style="color: ${isCorrect ? '#10b981' : '#ef4444'}">${userAnsText}</span>
                    </div>
                    ${!isCorrect ? `
                    <div class="quiz-review-answer-line">
                        <strong>Correct Answer:</strong> <span style="color: #10b981">${correctAnsText}</span>
                    </div>
                    ` : ''}
                    <div class="quiz-review-explanation">
                        <strong>Explanation:</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });
        reviewHtml += '</div>';
        
        reviewContainer.innerHTML = reviewHtml;
        reviewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// --------------------------------------------------
//              Theme & Sidebar Init
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Mobile Sidebar Toggles
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));
    }
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024 && e.target.classList.contains('toc-link') && sidebar) {
            sidebar.classList.remove('open');
        }
    });

    // Back to Top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Render components
    renderSidebar();
    initScrollSpy();
    initSearch();
    initCopyButtons();
    QuizManager.init();
});
window.QuizManager = QuizManager;
