// Wings Fly Premium Auth System (Supabase Integration)
// Use the globally initialized supabase client
const wingsAuthClient = window.supabase;



document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const submitBtn = loginForm.querySelector('button');

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Logging in...';

            const { data, error } = await wingsAuthClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            alert('Login Successful! Welcome to Wings Fly Academy.');
            // Redirect to the existing Web App dashboard
            window.location.href = '../Wings-Fly-Academy-1/index.html'; 

        } catch (error) {
            alert('Login Failed: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Login to Dashboard';
        }
    });

    // Handle Signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const submitBtn = signupForm.querySelector('button');

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Creating Account...';

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) throw error;

            alert('Account created! Please check your email for confirmation.');
            signupForm.reset();

        } catch (error) {
            alert('Signup Failed: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Register Now';
        }
    });
});
