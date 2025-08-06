document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;

    // --- SHARED LOGIC ---
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitButton = rsvpForm.querySelector('button[type="submit"]');
            
            const existingError = rsvpForm.querySelector('.form-error');
            if(existingError) existingError.remove();

            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                SUBMITTING...`;
            
            const scriptURL = atob(config.encodedUrl); 
            const formData = new FormData(rsvpForm);
            
            const checkedEvents = rsvpForm.querySelectorAll('input[type="checkbox"]:checked');
            let eventsValue = [];
            checkedEvents.forEach(checkbox => {
                eventsValue.push(checkbox.parentElement.querySelector('label').textContent);
            });
            formData.append('events', eventsValue.join(', '));


            fetch(scriptURL, { method: 'POST', body: formData})
                .then(response => {
                    if (response.ok) return response;
                    throw new Error('Network response was not ok.');
                })
                .then(() => {
                    document.getElementById('form-content').classList.add('hidden');
                    document.getElementById('rsvp-confirmation').classList.remove('hidden');
                })
                .catch(error => {
                    console.error('Error:', error);
                    const errorMessage = document.createElement('p');
                    errorMessage.className = 'form-error text-red-600 text-sm mt-4 text-center';
                    errorMessage.textContent = 'Sorry, there was an error submitting your RSVP. Please try again.';
                    rsvpForm.appendChild(errorMessage);
                    
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'SUBMIT RSVP';
                });
        });
    }

    document.addEventListener('contextmenu', event => event.preventDefault());

    // Event Tab Logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });


    // --- DESKTOP-ONLY LOGIC ---
    if (!isMobile) {
        const container = document.getElementById('main-container');
        const pages = document.querySelectorAll('.page');
        const navDotsContainer = document.getElementById('nav-dots');
        const pageCount = pages.length;
        let currentPage = 0;
        let isScrolling = false;
        const scrollCooldown = 1500;

        // Create nav dots
        for(let i = 0; i < pageCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('nav-dot');
            dot.dataset.index = i;
            navDotsContainer.appendChild(dot);
        }
        const navDots = document.querySelectorAll('.nav-dot');

        const updateActiveState = () => {
            const scrollLeft = currentPage * window.innerWidth;
            container.style.transform = `translateX(-${scrollLeft}px)`;

            pages.forEach((page, index) => {
                page.classList.toggle('active', index === currentPage);
            });
            navDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentPage);
            });
        };

        const changePage = (direction) => {
            if (isScrolling) return;
            isScrolling = true;

            if (direction === 'next') {
                currentPage = Math.min(pageCount - 1, currentPage + 1);
            } else if (direction === 'prev') {
                currentPage = Math.max(0, currentPage - 1);
            }
            
            updateActiveState();

            setTimeout(() => {
                isScrolling = false;
            }, scrollCooldown);
        };

        const handleScroll = (event) => {
            if (event.deltaY > 0) {
                changePage('next');
            } else {
                changePage('prev');
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowRight') {
                changePage('next');
            } else if (event.key === 'ArrowLeft') {
                changePage('prev');
            }
        };
        
        const handleNavClick = (event) => {
             if (event.target.classList.contains('nav-dot')) {
                 currentPage = parseInt(event.target.dataset.index);
                 updateActiveState();
             }
        };
        
        // Initial state
        updateActiveState();
        
        window.addEventListener('wheel', handleScroll);
        window.addEventListener('keydown', handleKeyDown);
        navDotsContainer.addEventListener('click', handleNavClick);
    }
});