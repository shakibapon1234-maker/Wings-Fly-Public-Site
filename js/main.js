document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.85)';
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = 'none';
        }
    });

    // --- Hero Slider & Parallax Logic ---
    const hero = document.querySelector('.hero');
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    // Auto Slide every 5s
    const slideInterval = setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }, 5000);

    // Dot Clicks
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            clearInterval(slideInterval); // Stop auto-slide on manual click
        });
    });

    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const activeImg = document.querySelector('.hero-slide.active .parallax-img');
            const activeCard = document.querySelector('.hero-slide.active .floating-card');

            if (activeImg) {
                const moveX = (clientX - innerWidth / 2) / 40;
                const moveY = (clientY - innerHeight / 2) / 40;
                activeImg.style.transform = `translate(${moveX}px, ${moveY}px) rotateY(${moveX / 5}deg) rotateX(${-moveY / 5}deg)`;
            }
            
            if (activeCard) {
                const cardX = (innerWidth / 2 - clientX) / 20;
                const cardY = (innerHeight / 2 - clientY) / 20;
                activeCard.style.transform = `translate(${cardX}px, ${cardY}px)`;
            }
        });

        hero.addEventListener('mouseleave', () => {
            const allImgs = document.querySelectorAll('.parallax-img');
            const allCards = document.querySelectorAll('.floating-card');
            
            allImgs.forEach(img => img.style.transform = 'translate(0, 0) rotateY(0) rotateX(0)');
            allCards.forEach(card => card.style.transform = 'translate(0, 0)');
        });
    }

    // --- Reveal Animations on Scroll ---
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Auth Modal Logic
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeModal = document.querySelector('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    if (openAuthBtn) {
        openAuthBtn.onclick = () => authModal.style.display = 'block';
    }

    if (closeModal) {
        closeModal.onclick = () => authModal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == authModal) {
            authModal.style.display = 'none';
        }
    };

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tab}Form`).classList.add('active');
        });
    });

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Success Stories Carousel Logic ---
    const successTrack = document.querySelector('.success-track');
    const successCards = document.querySelectorAll('.success-card-premium');
    const successPrev = document.querySelector('.nav-btn.prev');
    const successNext = document.querySelector('.nav-btn.next');
    const successDots = document.querySelectorAll('.dot-success');

    let successIndex = 0;

    function updateSuccessCarousel() {
        if (!successTrack || successCards.length === 0) return;
        
        const cardWidth = successCards[0].offsetWidth + 40; // Card width + gap
        successTrack.style.transform = `translateX(-${successIndex * cardWidth}px)`;
        
        // Update dots
        successDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === successIndex);
        });
    }

    if (successNext) {
        successNext.addEventListener('click', () => {
            successIndex = (successIndex + 1) % successCards.length;
            updateSuccessCarousel();
        });
    }

    if (successPrev) {
        successPrev.addEventListener('click', () => {
            successIndex = (successIndex - 1 + successCards.length) % successCards.length;
            updateSuccessCarousel();
        });
    }

    successDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            successIndex = idx;
            updateSuccessCarousel();
        });
    });

    // Auto slide for success stories
    setInterval(() => {
        if (successCards.length > 1) {
            successIndex = (successIndex + 1) % successCards.length;
            updateSuccessCarousel();
        }
    }, 8000);
});
