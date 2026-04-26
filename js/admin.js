// Admin Dashboard Logic - Rebuilt for Stability
document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_TOKEN = 'wingsfly77'; // Secret Access Token
    
    const loginOverlay = document.getElementById('login-overlay');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const adminPassInput = document.getElementById('admin-pass');
    const loginError = document.getElementById('login-error');

    // --- Authentication ---
    loginBtn.addEventListener('click', () => {
        if (adminPassInput.value === ADMIN_TOKEN) {
            loginOverlay.style.display = 'none';
            adminPanel.style.display = 'flex';
            console.log('Login successful, loading data...');
            loadSubmissions();
            loadGallery();
        } else {
            loginError.textContent = 'ভুল কোড! আবার চেষ্টা করুন।';
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        location.reload();
    });

    // --- Tab Switching ---
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-tab]');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) content.classList.add('active');
            });
            if (targetTab === 'submissions') loadSubmissions();
            if (targetTab === 'payment-verification') loadPayments();
            if (targetTab === 'gallery-manager') loadGallery();
            if (targetTab === 'course-manager') loadCourses();
            if (targetTab === 'instructor-manager') loadInstructors();
            if (targetTab === 'site-config') loadSiteConfig();
        });
    });

    // --- Site Config Logic ---
    async function loadSiteConfig() {
        const { data } = await window.supabase.from('site_config').select('*');
        if (data) {
            data.forEach(item => {
                const el = document.getElementById(`set-${item.key.replace('_','-')}`);
                if(el) el.value = item.value;
            });
        }
    }

    document.getElementById('site-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = [
            { key: 'phone', value: document.getElementById('set-phone').value },
            { key: 'address', value: document.getElementById('set-address').value },
            { key: 'chairman_message', value: document.getElementById('set-chairman-msg').value }
        ];

        for (const up of updates) {
            await window.supabase.from('site_config').update({ value: up.value }).eq('key', up.key);
        }
        alert('সাইট সেটিংস আপডেট হয়েছে!');
    });

    // --- Course Manager Logic ---
    async function loadCourses() {
        const list = document.getElementById('courses-list');
        list.innerHTML = '<tr><td colspan="5">লোড হচ্ছে...</td></tr>';
        const { data } = await window.supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (data) {
            list.innerHTML = '';
            data.forEach(c => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${c.image_url}" width="50" style="border-radius:5px;"></td>
                    <td>${c.title}</td>
                    <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.description}</td>
                    <td>${c.price}</td>
                    <td><button class="delete-btn-small" onclick="deleteCourse(${c.id})">Delete</button></td>
                `;
                list.appendChild(row);
            });
        }
    }

    document.getElementById('add-course-btn').onclick = async () => {
        const title = prompt('কোর্সের নাম:');
        const price = prompt('কোর্স ফি:');
        const image_url = prompt('ছবির ইউআরএল (URL):');
        const description = prompt('সংক্ষিপ্ত বর্ণনা:');
        
        if (title && image_url) {
            await window.supabase.from('courses').insert([{ title, price, image_url, description }]);
            loadCourses();
        }
    };

    window.deleteCourse = async (id) => {
        if (confirm('আপনি কি এই কোর্সটি ডিলিট করতে চান?')) {
            await window.supabase.from('courses').delete().eq('id', id);
            loadCourses();
        }
    };

    // --- Instructor Manager Logic ---
    async function loadInstructors() {
        const list = document.getElementById('instructors-list');
        list.innerHTML = '<tr><td colspan="4">লোড হচ্ছে...</td></tr>';
        const { data } = await window.supabase.from('instructors').select('*').order('created_at', { ascending: false });
        if (data) {
            list.innerHTML = '';
            data.forEach(t => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${t.image_url}" width="50" height="50" style="border-radius:50%; object-fit:cover;"></td>
                    <td>${t.name}</td>
                    <td>${t.designation}</td>
                    <td><button class="delete-btn-small" onclick="deleteInstructor(${t.id})">Delete</button></td>
                `;
                list.appendChild(row);
            });
        }
    }

    document.getElementById('add-instructor-btn').onclick = async () => {
        const name = prompt('শিক্ষকের নাম:');
        const designation = prompt('পদবী:');
        const image_url = prompt('ছবির ইউআরএল (URL):');
        
        if (name && image_url) {
            await window.supabase.from('instructors').insert([{ name, designation, image_url }]);
            loadInstructors();
        }
    };

    window.deleteInstructor = async (id) => {
        if (confirm('আপনি কি এই শিক্ষককে ডিলিট করতে চান?')) {
            await window.supabase.from('instructors').delete().eq('id', id);
            loadInstructors();
        }
    };

    // --- Payments Verification Logic ---
    async function loadPayments() {
        const listContainer = document.getElementById('admin-payments-list');
        if(!listContainer) return;

        listContainer.innerHTML = '<tr><td colspan="7" style="text-align:center;">লোড হচ্ছে...</td></tr>';

        try {
            const { data, error } = await window.supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            listContainer.innerHTML = '';
            data.forEach(p => {
                const row = document.createElement('tr');
                const statusColor = p.status === 'approved' ? '#00ffa3' : (p.status === 'rejected' ? '#ff4d4d' : '#FFD700');
                
                row.innerHTML = `
                    <td>${p.student_name}</td>
                    <td>${p.course_name}</td>
                    <td>${p.amount} TK</td>
                    <td>${p.payment_method}</td>
                    <td><b>${p.transaction_id}</b></td>
                    <td><span style="color:${statusColor}">${p.status.toUpperCase()}</span></td>
                    <td>
                        ${p.status === 'pending' ? `
                            <button class="btn-primary" style="padding:5px 10px; font-size:12px; background:#00ffa3; color:black; border:none;" onclick="verifyPayment(${p.id}, 'approved')">Approve</button>
                            <button class="delete-btn-small" style="padding:5px 10px; font-size:12px;" onclick="verifyPayment(${p.id}, 'rejected')">Reject</button>
                        ` : '<span style="opacity:0.5;">সম্পন্ন</span>'}
                    </td>
                `;
                listContainer.appendChild(row);
            });
        } catch (err) {
            listContainer.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ff4d4d;">এরর: ${err.message}</td></tr>`;
        }
    }

    window.verifyPayment = async (id, status) => {
        if (!confirm(`আপনি কি এই পেমেন্টটি ${status} করতে চান?`)) return;
        try {
            const { error } = await window.supabase
                .from('payments')
                .update({ status })
                .eq('id', id);
            
            if (error) throw error;
            loadPayments();
        } catch (err) {
            alert('ভুল হয়েছে: ' + err.message);
        }
    };

    document.getElementById('refresh-payments').addEventListener('click', loadPayments);

    // --- Submissions Logic ---
    async function loadSubmissions() {
        console.log('Fetching submissions...');
        const listContainer = document.getElementById('enrollments-list');
        if(!listContainer) return;

        listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center;">তথ্য খোঁজা হচ্ছে...</td></tr>';

        try {
            const { data, error } = await window.supabase
                .from('enrollments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#FFD700;">এখনো কোনো আবেদন জমা পড়েনি।</td></tr>';
                return;
            }

            listContainer.innerHTML = '';
            data.forEach(item => {
                const date = new Date(item.created_at).toLocaleDateString('bn-BD');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.full_name}</td>
                    <td>${item.phone}</td>
                    <td>${item.course}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn-secondary" onclick="viewDetails('${item.message || 'নেই'}')">বিস্তারিত</button>
                        <button class="delete-btn-small" onclick="deleteEnrollment(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                listContainer.appendChild(row);
            });
        } catch (error) {
            console.error('Fetch Error:', error);
            listContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ff4d4d;">এরর: ${error.message}</td></tr>`;
        }
    }

    // Global helper functions
    window.viewDetails = (msg) => alert('স্টুডেন্ট মেসেজ: ' + msg);

    window.deleteEnrollment = async (id) => {
        if (!confirm('আপনি কি এই আবেদনটি মুছে ফেলতে চান?')) return;
        try {
            const { error } = await window.supabase.from('enrollments').delete().eq('id', id);
            if (error) throw error;
            loadSubmissions();
        } catch (error) {
            alert('মুছে ফেলা যায়নি: ' + error.message);
        }
    };

    const refreshBtn = document.getElementById('refresh-submissions');
    if(refreshBtn) refreshBtn.addEventListener('click', loadSubmissions);

    // --- Gallery Logic ---
    const galleryForm = document.getElementById('gallery-upload-form');
    if(galleryForm) {
        galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('img-title').value;
            const category = document.getElementById('img-category').value;
            const file = document.getElementById('img-file').files[0];
            const uploadBtn = document.getElementById('upload-btn');
            const status = document.getElementById('upload-status');

            if (!file) return;

            uploadBtn.disabled = true;
            uploadBtn.innerHTML = 'আপলোড হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const fileName = `${Date.now()}-${file.name}`;
                const { data: sData, error: sErr } = await window.supabase.storage
                    .from('wingsfly-gallery')
                    .upload(`gallery/${fileName}`, file);

                if (sErr) throw sErr;

                const { data: { publicUrl } } = window.supabase.storage
                    .from('wingsfly-gallery')
                    .getPublicUrl(`gallery/${fileName}`);

                const { error: dbErr } = await window.supabase
                    .from('gallery_items')
                    .insert([{ title, category, image_url: publicUrl }]);

                if (dbErr) throw dbErr;

                status.innerHTML = '<p style="color:#00ffa3;">সাফল্যের সাথে আপলোড হয়েছে!</p>';
                galleryForm.reset();
                loadGallery();
            } catch (err) {
                status.innerHTML = `<p style="color:#ff4d4d;">ভুল হয়েছে: ${err.message}</p>`;
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = 'আপলোড করুন <i class="fa-solid fa-upload"></i>';
            }
        });
    }

    async function loadGallery() {
        const galleryGrid = document.getElementById('admin-gallery-list');
        if(!galleryGrid) return;

        try {
            const { data, error } = await window.supabase
                .from('gallery_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            galleryGrid.innerHTML = '';
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'admin-gallery-item';
                card.innerHTML = `
                    <img src="${item.image_url}">
                    <button class="delete-btn" onclick="deleteGalleryItem(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                `;
                galleryGrid.appendChild(card);
            });
        } catch (err) {
            console.error('Gallery Error:', err);
        }
    }

    window.deleteGalleryItem = async (id) => {
        if (!confirm('আপনি কি এই ছবিটি মুছে ফেলতে চান?')) return;
        await window.supabase.from('gallery_items').delete().eq('id', id);
        loadGallery();
    };
});
