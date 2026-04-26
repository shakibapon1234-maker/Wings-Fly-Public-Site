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
    // --- Load Live Gallery from Supabase ---
    async function loadLiveGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid || typeof window.supabase === 'undefined') {
            console.log('Supabase or gallery grid not found, keeping default items.');
            return;
        }

        try {
            const { data, error } = await window.supabase
                .from('gallery_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Gallery Fetch Error:', error);
                return;
            }

            if (data && data.length > 0) {
                galleryGrid.innerHTML = ''; // Clear hardcoded items only when we have real data
                data.forEach(item => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = `gallery-item ${item.category}`;
                    galleryItem.style.display = 'block';
                    galleryItem.innerHTML = `
                        <div class="gallery-card">
                            <img src="${item.image_url}" alt="${item.title}" loading="lazy">
                            <div class="gallery-overlay">
                                <span class="category">${item.category === 'events' ? 'ইভেন্টস' : item.category === 'ceremony' ? 'সার্টিফিকেট বিতরণ' : 'মিডিয়া নিউজ'}</span>
                                <h3>${item.title}</h3>
                                <a href="${item.image_url}" target="_blank" class="view-btn"><i class="fa-solid fa-expand"></i></a>
                            </div>
                        </div>
                    `;
                    galleryGrid.appendChild(galleryItem);
                });
                
                // Re-run filter logic for new items
                updateGallery();
            }
        } catch (err) {
            console.warn('Gallery System Notice:', err.message);
        }
    }

    // Call gallery loader safely
    setTimeout(loadLiveGallery, 500);

    // --- Gallery Filtering Logic ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active Button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                item.style.transition = '0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 500);
                }
            });
        });
    });
    // --- Enrollment Form Submission ---
    const enrollForm = document.getElementById('enrollment-form');
    const formStatus = document.getElementById('form-status');

    if (enrollForm) {
        enrollForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-enrollment');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'প্রসেসিং হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

            const formData = {
                full_name: document.getElementById('student-name').value,
                phone: document.getElementById('student-phone').value,
                email: document.getElementById('student-email').value,
                course: document.getElementById('selected-course').value,
                message: document.getElementById('student-message').value,
                created_at: new Date().toISOString()
            };

            try {
                // If Supabase is initialized with real keys, this will work
                if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
                    const { error } = await supabase.from('enrollments').insert([formData]);
                    if (error) throw error;
                    
                    formStatus.innerHTML = 'ধন্যবাদ! আপনার আবেদনটি সফলভাবে জমা হয়েছে।';
                    formStatus.className = 'form-status success';
                    enrollForm.reset();
                } else {
                    // Fallback for demo/missing keys
                    console.log('Form Data:', formData);
                    setTimeout(() => {
                        formStatus.innerHTML = 'সিস্টেম কানেক্ট করা হচ্ছে। আপনার তথ্যটি কনসোলে সেভ করা হয়েছে।';
                        formStatus.className = 'form-status error';
                    }, 1000);
                }
            } catch (error) {
                console.error('Error:', error);
                formStatus.innerHTML = 'দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'আবেদন জমা দিন <i class="fa-solid fa-paper-plane"></i>';
            }
        });
    }

    // --- Smooth Scroll for Enrollment Button ---
    const enrollBtns = document.querySelectorAll('button:contains("ভর্তি ফরম"), .btn-primary');
    enrollBtns.forEach(btn => {
        if (btn.textContent.includes('ভর্তি ফরম')) {
            btn.addEventListener('click', () => {
                document.getElementById('enroll').scrollIntoView({ behavior: 'smooth' });
            });
        }
    });
});
