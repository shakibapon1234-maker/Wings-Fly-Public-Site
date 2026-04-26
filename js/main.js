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

    // --- Dynamic Content Loading from Supabase ---
    async function loadSiteDynamicContent() {
        if (!window.supabase) return;

        // 1. Load Site Config (Phone, Address, Chairman Info, etc.)
        try {
            const { data: config } = await window.supabase.from('site_config').select('*');
            if (config) {
                config.forEach(item => {
                    if (item.key === 'phone') {
                        document.querySelectorAll('.footer-contact p:nth-child(3), .hero-btns a[href^="tel:"]').forEach(el => {
                            if(el.tagName === 'A') el.href = `tel:${item.value}`;
                            el.innerHTML = `<i class="fa-solid fa-phone"></i> ${item.value}`;
                        });
                    }
                    if (item.key === 'address') {
                        document.querySelectorAll('.footer-contact p:nth-child(2)').forEach(el => {
                            el.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${item.value}`;
                        });
                    }
                    if (item.key === 'chairman_message') {
                        const messageEl = document.getElementById('dynamic-chairman-msg');
                        if (messageEl) messageEl.textContent = `"${item.value}"`;
                    }
                    if (item.key === 'chairman_name') {
                        const nameEl = document.getElementById('dynamic-chairman-name');
                        if (nameEl) nameEl.textContent = item.value;
                    }
                    if (item.key === 'chairman_designation') {
                        const desigEl = document.getElementById('dynamic-chairman-designation');
                        if (desigEl) desigEl.textContent = item.value;
                    }
                    if (item.key === 'chairman_image') {
                        const imgEl = document.getElementById('dynamic-chairman-img');
                        if (imgEl && item.value) imgEl.src = item.value;
                    }
                });
            }
        } catch (e) { console.error('Config Load Error:', e); }

        // 2. Load Courses
        try {
            const { data: dbCourses } = await window.supabase.from('courses').select('*').order('created_at', { ascending: true });
            if (dbCourses && dbCourses.length > 0) {
                const courseContainer = document.getElementById('dynamic-courses');
                if (courseContainer) {
                    courseContainer.innerHTML = '';
                    dbCourses.forEach((c, idx) => {
                        const isFeatured = idx === 0;
                        const card = document.createElement('div');
                        card.className = `course-card ${isFeatured ? 'featured' : 'standard'}`;
                        card.innerHTML = `
                            ${isFeatured ? '<div class="course-tag">বেস্ট সেলার</div>' : ''}
                            <div class="course-img">
                                <img src="${c.image_url}" alt="${c.title}">
                                <div class="course-overlay">
                                    <button class="btn-primary" onclick="var m=document.getElementById('admissionModal');if(m){m.style.display='flex';m.classList.add('active');}">Enroll Now</button>
                                    <button class="btn-secondary" onclick="window.openCourseDetails('${encodeURIComponent(c.title)}', '${encodeURIComponent(c.level || '')}', '${encodeURIComponent(c.certificate_type || '')}', '${encodeURIComponent(c.description || '')}', '${encodeURIComponent(c.syllabus || '')}')" style="margin-top: 10px; padding: 12px 30px; font-weight: 600;">বিস্তারিত</button>
                                </div>
                            </div>
                            <div class="course-content">
                                <h3>${c.title}</h3>
                                <p>${c.description || 'কোর্সের বিস্তারিত জানতে যোগাযোগ করুন।'}</p>
                                <div class="course-meta">
                                    <span><i class="fa-solid fa-clock"></i> ${c.duration || '৩ মাস'}</span>
                                    <span class="price">${c.price || 'যোগাযোগ করুন'}</span>
                                </div>
                            </div>
                        `;
                        courseContainer.appendChild(card);
                    });
                }
            }
        } catch (e) { console.error('Courses Load Error:', e); }

        window.openCourseDetails = (title, level, cert, desc, syllabus) => {
            document.getElementById('modalCourseTitle').textContent = decodeURIComponent(title);
            document.getElementById('modalCourseLevel').innerHTML = `<i class="fa-solid fa-layer-group"></i> ` + (decodeURIComponent(level) || 'প্রফেশনাল');
            document.getElementById('modalCourseCert').innerHTML = `<i class="fa-solid fa-certificate"></i> ` + (decodeURIComponent(cert) || 'আন্তর্জাতিক মানের');
            document.getElementById('modalCourseDesc').textContent = decodeURIComponent(desc);
            document.getElementById('modalCourseSyllabus').textContent = decodeURIComponent(syllabus);
            document.getElementById('courseDetailsModal').style.display = 'flex';
        };

        // 3. Load Instructors
        try {
            const { data: dbInstructors } = await window.supabase.from('instructors').select('*').order('created_at', { ascending: true });
            if (dbInstructors && dbInstructors.length > 0) {
                const trainerTrack = document.getElementById('dynamic-instructors');
                if (trainerTrack) {
                    trainerTrack.innerHTML = '';
                    dbInstructors.forEach((t, idx) => {
                        const isGold = idx % 2 !== 0;
                        const trainer = document.createElement('div');
                        trainer.className = 'gallery-frame-wrapper trainer-card';
                        trainer.innerHTML = `
                            <div class="luxury-frame ${isGold ? 'gold-heavy' : ''}">
                                <div class="inner-border"></div>
                                <div class="trainer-img-box">
                                    <img src="${t.image_url}" alt="${t.name}">
                                </div>
                            </div>
                            <div class="frame-label">
                                <h4>${t.name}</h4>
                                <span>${t.designation}</span>
                            </div>
                        `;
                        trainerTrack.appendChild(trainer);
                    });
                    
                    if (typeof initTrainerSlider === 'function') {
                        initTrainerSlider();
                    }
                }
            }
        } catch (e) { console.error('Instructors Load Error:', e); }

        // 4. Load Gallery Items
        try {
            const { data: dbGallery } = await window.supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
            if (dbGallery && dbGallery.length > 0) {
                const galleryGrid = document.getElementById('dynamic-gallery');
                if (galleryGrid) {
                    galleryGrid.innerHTML = '';
                    dbGallery.forEach(g => {
                        const item = document.createElement('div');
                        item.className = `gallery-item ${g.category}`;
                        item.innerHTML = `
                            <div class="gallery-card">
                                <img src="${g.image_url}" alt="${g.title}">
                                <div class="gallery-overlay">
                                    <span class="category">${g.category === 'events' ? 'ইভেন্টস' : (g.category === 'ceremony' ? 'সার্টিফিকেট' : 'মিডিয়া')}</span>
                                    <h3>${g.title}</h3>
                                    <a href="${g.image_url}" target="_blank" class="view-btn"><i class="fa-solid fa-expand"></i></a>
                                </div>
                            </div>
                        `;
                        galleryGrid.appendChild(item);
                    });
                }
            }
        } catch (e) { console.error('Gallery Load Error:', e); }

        // 5. Load Success Stories
        try {
            const { data: dbStories } = await window.supabase.from('success_stories').select('*').order('created_at', { ascending: false });
            if (dbStories && dbStories.length > 0) {
                const track = document.querySelector('.success-track');
                if (track) {
                    track.innerHTML = '';
                    dbStories.forEach(s => {
                        const card = document.createElement('div');
                        card.className = 'success-card-premium';
                        card.innerHTML = `
                            <div class="success-card-inner">
                                <div class="student-photo-wrapper">
                                    <div class="glow-ring"></div>
                                    <div class="student-photo">
                                        <img src="${s.image_url}" alt="${s.name}">
                                    </div>
                                </div>
                                <div class="success-info-premium">
                                    <span class="congrats-text">Congratulations!</span>
                                    <h3 class="student-name">${s.name}</h3>
                                    <p class="achievement-text">${s.achievement}</p>
                                    <div class="batch-tag">
                                        <i class="fa-solid fa-user-graduate"></i> ${s.batch}
                                    </div>
                                </div>
                            </div>
                        `;
                        track.appendChild(card);
                    });
                    
                    // Reinitialize success carousel if exists
                    if (typeof initSuccessCarousel === 'function') {
                        initSuccessCarousel();
                    }
                }
            }
        } catch (e) { console.error('Success Stories Load Error:', e); }
    }

    // Call it immediately
    loadSiteDynamicContent();

    // --- Success Story Carousel Logic ---
    window.initSuccessCarousel = function() {
        const track = document.querySelector('.success-track');
        const cards = document.querySelectorAll('.success-card-premium');
        if (!track || cards.length === 0) return;

        let currentIndex = 0;
        const totalCards = cards.length;
        
        function updateCarousel() {
            // Check if we need to reset to the beginning for infinite loop effect
            if (currentIndex >= totalCards) {
                currentIndex = 0;
            } else if (currentIndex < 0) {
                currentIndex = totalCards - 1;
            }
            
            // Calculate the width of one card + gap (assuming gap is standard or we measure the first card's offsetWidth)
            const cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(track).gap || 30);
            const offset = -(currentIndex * cardWidth);
            
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(${offset}px)`;
        }

        // Auto slide
        let autoSlideInterval = setInterval(() => {
            currentIndex++;
            updateCarousel();
        }, 3000);

        // Pause on hover
        track.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        track.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(() => {
                currentIndex++;
                updateCarousel();
            }, 3000);
        });
    };

    // --- Hero Slider Logic (with diverse animations) ---
    let currentSlide = 0;
    let isAnimating = false;
    
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length === 0) return;

        // Clean all animation classes
        function cleanSlide(slide) {
            slide.classList.remove('active', 'leaving', 'slide-enter', 'slide-leave');
        }

        function showSlide(nextIndex) {
            if (isAnimating || nextIndex === currentSlide) return;
            isAnimating = true;

            const currentSlideEl = slides[currentSlide];
            const nextSlideEl = slides[nextIndex];

            // 1. Start leaving animation on current slide
            currentSlideEl.classList.remove('active', 'slide-enter');
            currentSlideEl.classList.add('leaving', 'slide-leave');

            // 2. Start entering animation on next slide
            nextSlideEl.classList.add('active', 'slide-enter');

            // 3. Update dots
            dots.forEach(d => d.classList.remove('active'));
            if (dots[nextIndex]) dots[nextIndex].classList.add('active');

            // 4. After animation ends, clean up
            const animDuration = 1200; // ms - matches longest animation
            setTimeout(() => {
                cleanSlide(currentSlideEl);
                // Remove slide-enter after animation completes (keep active)
                nextSlideEl.classList.remove('slide-enter');
                currentSlide = nextIndex;
                isAnimating = false;
            }, animDuration);
        }

        // Dot click handlers
        dots.forEach((dot, idx) => {
            dot.onclick = () => showSlide(idx);
        });

        // Auto-advance every 5 seconds
        setInterval(() => {
            if (!isAnimating) {
                let next = (currentSlide + 1) % slides.length;
                showSlide(next);
            }
        }, 5000);
    }

    // --- Trainer Slider Logic ---
    function initTrainerSlider() {
        const track = document.querySelector('.gallery-track');
        const trainers = document.querySelectorAll('.trainer-card');
        if (!track || trainers.length === 0) return;

        // Start at the middle card (or 0 if only 1 card)
        let trainerIndex = trainers.length <= 2 ? 0 : Math.floor(trainers.length / 2);

        function updateTrainer() {
            trainers.forEach((t, idx) => {
                t.classList.toggle('active', idx === trainerIndex);
            });
            
            if (trainers.length === 1) {
                // Single card: center it, no transform needed
                track.style.transform = 'translateX(0)';
                track.style.justifyContent = 'center';
            } else {
                track.style.justifyContent = 'flex-start';
                const cardWidth = trainers[0].offsetWidth + 80; // Include negative margins
                const containerWidth = track.parentElement.offsetWidth;
                const offset = (containerWidth / 2) - (trainers[0].offsetWidth / 2) - (trainerIndex * cardWidth);
                track.style.transform = `translateX(${offset}px)`;
            }
        }

        // Remove old event listeners by cloning buttons
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        
        if (nextBtn) {
            const newNext = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            newNext.addEventListener('click', () => {
                trainerIndex = (trainerIndex + 1) % trainers.length;
                updateTrainer();
            });
        }
        if (prevBtn) {
            const newPrev = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            newPrev.addEventListener('click', () => {
                trainerIndex = (trainerIndex - 1 + trainers.length) % trainers.length;
                updateTrainer();
            });
        }

        window.addEventListener('resize', updateTrainer);
        updateTrainer();

        // Auto-rotate every 4 seconds if more than 1 card
        if (trainers.length > 1) {
            setInterval(() => {
                trainerIndex = (trainerIndex + 1) % trainers.length;
                updateTrainer();
            }, 4000);
        }
    }

    // --- Reveal Animations ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    function initReveal() {
        document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
    }

    // --- Gallery Logic ---
    async function loadLiveGallery() {
        const grid = document.querySelector('.gallery-grid');
        if (!grid || !window.supabase) return;

        try {
            const { data } = await window.supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
            if (data && data.length > 0) {
                grid.innerHTML = '';
                data.forEach(item => {
                    const el = document.createElement('div');
                    el.className = `gallery-item ${item.category}`;
                    el.innerHTML = `
                        <div class="gallery-card">
                            <img src="${item.image_url}" alt="${item.title}" style="object-fit: contain;">
                            <div class="gallery-overlay">
                                <h3>${item.title}</h3>
                            </div>
                        </div>
                    `;
                    grid.appendChild(el);
                });
            }
        } catch (e) { console.error(e); }
    }

    // --- Enrollment Form ---
    const enrollForm = document.getElementById('enrollment-form');
    if (enrollForm) {
        enrollForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-enrollment');
            btn.disabled = true;
            btn.innerHTML = 'পাঠানো হচ্ছে...';

            const formData = {
                full_name: document.getElementById('student-name').value,
                phone: document.getElementById('student-phone').value,
                email: document.getElementById('student-email').value,
                course: document.getElementById('selected-course').value,
                message: document.getElementById('student-message').value
            };

            try {
                const { error } = await window.supabase.from('enrollments').insert([formData]);
                if (error) throw error;

                // EmailJS
                await emailjs.send("service_1v33wgb", "template_5qo6h0i", {
                    name: formData.full_name,
                    time: new Date().toLocaleString(),
                    message: `নাম: ${formData.full_name}\nফোন: ${formData.phone}\nকোর্স: ${formData.course}`
                });

                document.getElementById('form-status').innerHTML = 'সফলভাবে পাঠানো হয়েছে!';
                enrollForm.reset();
            } catch (err) {
                document.getElementById('form-status').innerHTML = 'এরর হয়েছে, আবার চেষ্টা করুন।';
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'আবেদন জমা দিন';
            }
        });
    }

    // Init All
    initHeroSlider();
    loadSiteDynamicContent();
    loadLiveGallery();
    initReveal();
});
