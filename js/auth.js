// Wings Fly Premium Auth System
const wingsAuthClient = window.supabase;

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const closeAuth = document.getElementById('closeAuth');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authContents = document.querySelectorAll('.auth-content');

    // --- Modal Control ---
    if(openAuthBtn) {
        openAuthBtn.addEventListener('click', () => {
            authModal.classList.add('active');
        });
    }

    if(closeAuth) {
        closeAuth.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.classList.remove('active');
    });

    // --- Tab Switching ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            authContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) content.classList.add('active');
            });
        });
    });

    // --- Login Logic ---
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const submitBtn = loginForm.querySelector('button');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'প্রবেশ করা হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

                const { data, error } = await wingsAuthClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                // Redirect to Student Dashboard
                window.location.href = 'student-dashboard.html';

            } catch (error) {
                alert('লগইন ব্যর্থ হয়েছে: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'প্রবেশ করুন';
            }
        });
    }

    // --- Signup Logic ---
    const signupForm = document.getElementById('signupForm');
    if(signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = signupForm.querySelector('input[type="text"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            const submitBtn = signupForm.querySelector('button');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'অ্যাকাউন্ট তৈরি হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

                const { data, error } = await wingsAuthClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: { full_name: fullName }
                    }
                });

                if (error) throw error;

                alert('অ্যাকাউন্ট তৈরি হয়েছে! দয়া করে আপনার ইমেইল চেক করুন।');
                signupForm.reset();

            } catch (error) {
                alert('রেজিস্ট্রেশন ব্যর্থ হয়েছে: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'রেজিস্ট্রেশন করুন';
            }
        });
    }
});
