document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('main-container');
    const pages = document.querySelectorAll('.page');
    const navDotsContainer = document.getElementById('nav-dots');
    const pageCount = pages.length;
    let currentPage = 0;
    let isScrolling = false;

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

    const handleScroll = (event) => {
        if (isScrolling) return;
        isScrolling = true;
        
        if (event.deltaY > 0) { // Scrolling down/right
            currentPage = Math.min(pageCount - 1, currentPage + 1);
        } else { // Scrolling up/left
            currentPage = Math.max(0, currentPage - 1);
        }
        
        updateActiveState();

        setTimeout(() => {
            isScrolling = false;
        }, 1500); // Cooldown to prevent rapid scrolling
    };
    
    const handleNavClick = (event) => {
         if (event.target.classList.contains('nav-dot')) {
             currentPage = parseInt(event.target.dataset.index);
             updateActiveState();
         }
    }
    
    // Initial state
    updateActiveState();
    
    window.addEventListener('wheel', handleScroll);
    navDotsContainer.addEventListener('click', handleNavClick);
    
    const rsvpForm = document.getElementById('rsvp-form');

    const getScriptUrl = () => {
        try {
            if (process.env.GOOGLE_SCRIPT_URL) {
                 return atob(process.env.GOOGLE_SCRIPT_URL);
            }
            throw new Error("Configuration not found.");
        } catch (e) {
            console.error("Error decoding the script URL. Make sure config.js is loaded and the key is a valid Base64 string.", e);
            return '';
        }
    }

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitButton = rsvpForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'SUBMITTING...';

        const scriptUrl = getScriptUrl();
        if (!scriptUrl) {
            alert('Configuration error. Could not submit RSVP.');
            submitButton.disabled = false;
            submitButton.textContent = 'SUBMIT RSVP';
            return;
        }

        // Collect all checked event checkboxes
        const checkedEvents = rsvpForm.querySelectorAll('input[type="checkbox"]:checked');
        const formData = new FormData(rsvpForm);
        
        formData.delete('event');
        checkedEvents.forEach(checkbox => {
            formData.append('event', checkbox.nextElementSibling.textContent);
        });
        
        fetch(scriptUrl, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                document.getElementById('form-content').classList.add('hidden');
                document.getElementById('rsvp-confirmation').classList.remove('hidden');
            } else {
                throw new Error(data.message || 'An unknown error occurred.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Sorry, there was an error submitting your RSVP. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'SUBMIT RSVP';
        });
    });

    document.addEventListener('contextmenu', event => event.preventDefault());
});

