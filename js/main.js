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

        // 1. Load Site Config (Phone, Address, etc.)
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
                    if (item.key === 'email') {
                        document.querySelectorAll('.footer-contact p:nth-child(4)').forEach(el => {
                            el.innerHTML = `<i class="fa-solid fa-envelope"></i> ${item.value}`;
                        });
                    }
                    if (item.key === 'address') {
                        document.querySelectorAll('.footer-contact p:nth-child(2)').forEach(el => {
                            el.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${item.value}`;
                        });
                    }
                    if (item.key === 'chairman_message') {
                        const messageEl = document.querySelector('.chairman-info p');
                        if (messageEl) messageEl.textContent = item.value;
                    }
                });
            }
        } catch (e) { console.error('Config Load Error:', e); }

        // 2. Load Hero Slides
        try {
            const { data: dbSlides } = await window.supabase.from('hero_slides').select('*').order('created_at', { ascending: true });
            if (dbSlides && dbSlides.length > 0) {
                const sliderContainer = document.querySelector('.hero-slider');
                const dotsContainer = document.querySelector('.slider-dots');
                if (sliderContainer) {
                    sliderContainer.innerHTML = '';
                    dotsContainer.innerHTML = '';
                    dbSlides.forEach((s, idx) => {
                        const slide = document.createElement('div');
                        slide.className = `hero-slide ${idx === 0 ? 'active' : ''}`;
                        slide.innerHTML = `
                            <div class="parallax-img-wrapper">
                                <img src="${s.image_url}" alt="${s.title}" class="parallax-img">
                                <div class="floating-card card-1">
                                    <i class="fa-solid fa-star"></i>
                                    <span>${s.badge_text || 'Premium'}</span>
                                </div>
                            </div>
                        `;
                        sliderContainer.appendChild(slide);
                        
                        const dot = document.createElement('span');
                        dot.className = `dot ${idx === 0 ? 'active' : ''}`;
                        dotsContainer.appendChild(dot);
                    });
                    initHeroSlider(); // Re-init after loading
                }
            }
        } catch (e) { console.error('Hero Slides Load Error:', e); }

        // 3. Load Courses
        try {
            const { data: dbCourses } = await window.supabase.from('courses').select('*').order('created_at', { ascending: true });
            if (dbCourses && dbCourses.length > 0) {
                const courseGrid = document.querySelector('.courses-grid');
                if (courseGrid) {
                    courseGrid.innerHTML = '';
                    dbCourses.forEach(c => {
                        const card = document.createElement('div');
                        card.className = 'course-card';
                        card.setAttribute('data-reveal', '');
                        card.innerHTML = `
                            <div class="course-img">
                                <img src="${c.image_url}" alt="${c.title}">
                                <div class="course-overlay">
                                    <button class="btn-primary" onclick="document.getElementById('enroll').scrollIntoView({behavior:'smooth'})">ভর্তি হোন</button>
                                </div>
                            </div>
                            <div class="course-content">
                                <h3>${c.title}</h3>
                                <p>${c.description}</p>
                                <div class="course-meta">
                                    <span><i class="fa-solid fa-clock"></i> ৩ মাস</span>
                                    <span class="price">${c.price || 'যোগাযোগ করুন'}</span>
                                </div>
                            </div>
                        `;
                        courseGrid.appendChild(card);
                    });
                }
            }
        } catch (e) { console.error('Courses Load Error:', e); }

        // 4. Load Instructors
        try {
            const { data: dbInstructors } = await window.supabase.from('instructors').select('*').order('created_at', { ascending: true });
            if (dbInstructors && dbInstructors.length > 0) {
                const trainerTrack = document.querySelector('.gallery-track');
                if (trainerTrack) {
                    trainerTrack.innerHTML = '';
                    dbInstructors.forEach((t, idx) => {
                        const trainer = document.createElement('div');
                        trainer.className = `trainer-card ${idx === 1 ? 'active' : ''}`;
                        trainer.innerHTML = `
                            <div class="trainer-img-wrapper">
                                <img src="${t.image_url}" alt="${t.name}">
                                <div class="trainer-social">
                                    <a href="#"><i class="fa-brands fa-linkedin"></i></a>
                                </div>
                            </div>
                            <div class="trainer-info">
                                <h3>${t.name}</h3>
                                <p>${t.designation}</p>
                            </div>
                        `;
                        trainerTrack.appendChild(trainer);
                    });
                    initTrainerSlider(); // Re-init
                }
            }
        } catch (e) { console.error('Instructors Load Error:', e); }
    }

    // --- Hero Slider Logic ---
    let currentSlide = 0;
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length === 0) return;

        function showSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        }

        dots.forEach((dot, idx) => {
            dot.onclick = () => showSlide(idx);
        });

        setInterval(() => {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }, 5000);
    }

    // --- Trainer Slider Logic ---
    function initTrainerSlider() {
        const track = document.querySelector('.gallery-track');
        const trainers = document.querySelectorAll('.trainer-card');
        if (!track || trainers.length === 0) return;

        let trainerIndex = 1;
        function updateTrainer() {
            trainers.forEach((t, idx) => t.classList.toggle('active', idx === trainerIndex));
            const cardWidth = trainers[0].offsetWidth;
            const containerWidth = track.parentElement.offsetWidth;
            const offset = (containerWidth / 2) - (cardWidth / 2) - (trainerIndex * cardWidth);
            track.style.transform = `translateX(${offset}px)`;
        }

        document.querySelector('.next-btn')?.addEventListener('click', () => {
            trainerIndex = (trainerIndex + 1) % trainers.length;
            updateTrainer();
        });
        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            trainerIndex = (trainerIndex - 1 + trainers.length) % trainers.length;
            updateTrainer();
        });

        window.addEventListener('resize', updateTrainer);
        updateTrainer();
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
    loadSiteDynamicContent();
    loadLiveGallery();
    initReveal();
});
