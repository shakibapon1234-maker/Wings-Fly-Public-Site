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
        const oldActive = document.querySelector('.hero-slide.active');
        if (oldActive) {
            oldActive.classList.remove('active');
            oldActive.classList.add('leaving');
            setTimeout(() => {
                oldActive.classList.remove('leaving');
            }, 1000);
        }
        
        slides[index].classList.add('active');
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        currentSlide = index;
    }

    // Auto Slide every 4s for better viewing of unique animations
    const slideInterval = setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }, 4000);

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

    // --- Teachers Carousel (3D Center Mode) ---
    const galleryTrack = document.querySelector('.gallery-track');
    const trainerCards = document.querySelectorAll('.trainer-card');
    const galleryPrev = document.querySelector('.prev-btn');
    const galleryNext = document.querySelector('.next-btn');
    const galleryDots = document.querySelectorAll('.dot-gallery');

    let galleryIndex = 1; 

    function updateGallery() {
        if (!galleryTrack || trainerCards.length === 0) return;

        trainerCards.forEach((card, idx) => {
            card.classList.toggle('active', idx === galleryIndex);
        });

        const containerWidth = galleryTrack.parentElement.offsetWidth;
        const cardWidth = trainerCards[0].offsetWidth;
        // Calculate offset to center the active card
        const trackOffset = (containerWidth / 2) - (cardWidth / 2) - (galleryIndex * cardWidth);
        galleryTrack.style.transform = `translateX(${trackOffset}px)`;

        galleryDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === galleryIndex);
        });
    }

    if (galleryNext) {
        galleryNext.addEventListener('click', () => {
            galleryIndex = (galleryIndex + 1) % trainerCards.length;
            updateGallery();
        });
    }

    if (galleryPrev) {
        galleryPrev.addEventListener('click', () => {
            galleryIndex = (galleryIndex - 1 + trainerCards.length) % trainerCards.length;
            updateGallery();
        });
    }

    galleryDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            galleryIndex = idx;
            updateGallery();
        });
    });

    // Auto rotate every 6s
    setInterval(() => {
        galleryIndex = (galleryIndex + 1) % trainerCards.length;
        updateGallery();
    }, 6000);

    window.addEventListener('resize', updateGallery);
    setTimeout(updateGallery, 100); // Small delay for layout calc
});
