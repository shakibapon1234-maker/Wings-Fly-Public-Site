// Admin Dashboard Logic - Enhanced with Edit Modals
document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_TOKEN = 'wingsfly77';
    
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
            loadSubmissions();
            loadGallery();
        } else {
            loginError.textContent = 'ভুল কোড! আবার চেষ্টা করুন।';
        }
    });

    adminPassInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
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

    // =============================================
    // Helper: Upload Image to Supabase Storage
    // =============================================
    async function uploadImage(file, folder) {
        if (!file) return null;
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filePath = `${folder}/${fileName}`;
        const { data, error } = await window.supabase.storage.from('wingsfly-gallery').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = window.supabase.storage.from('wingsfly-gallery').getPublicUrl(filePath);
        return publicUrl;
    }

    // =============================================
    // Helper: Show Edit Modal
    // =============================================
    function showEditModal(title, fields, onSave) {
        // Remove any existing modal
        document.querySelector('.edit-modal-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.className = 'edit-modal-overlay';
        
        let fieldsHTML = fields.map(f => {
            if (f.type === 'textarea') {
                return `<div class="form-group">
                    <label>${f.label}</label>
                    <textarea id="edit-${f.name}" rows="4" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:12px; padding:12px; font-family:Inter,sans-serif;">${f.value || ''}</textarea>
                </div>`;
            }
            if (f.type === 'file') {
                return `<div class="form-group">
                    <label>${f.label}</label>
                    <input type="file" id="edit-${f.name}" accept="image/*">
                    <p style="font-size:12px; color:#aaa; margin-top:4px;">নতুন ছবি না দিলে আগেরটিই থাকবে।</p>
                </div>`;
            }
            return `<div class="form-group">
                <label>${f.label}</label>
                <input type="${f.type || 'text'}" id="edit-${f.name}" value="${f.value || ''}" placeholder="${f.placeholder || ''}">
            </div>`;
        }).join('');

        overlay.innerHTML = `
            <div class="edit-modal">
                <h3><i class="fa-solid fa-pen-to-square"></i> ${title}</h3>
                ${fieldsHTML}
                <div id="edit-modal-status"></div>
                <div class="modal-actions">
                    <button class="btn-cancel" id="modal-cancel">বাতিল</button>
                    <button class="btn-primary" id="modal-save"><i class="fa-solid fa-check"></i> সেভ করুন</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on cancel
        document.getElementById('modal-cancel').onclick = () => overlay.remove();
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        // Save handler
        document.getElementById('modal-save').onclick = async () => {
            const btn = document.getElementById('modal-save');
            const status = document.getElementById('edit-modal-status');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> সেভ হচ্ছে...';

            try {
                const values = {};
                for (const f of fields) {
                    if (f.type === 'file') {
                        values[f.name] = document.getElementById(`edit-${f.name}`).files[0];
                    } else {
                        values[f.name] = document.getElementById(`edit-${f.name}`).value;
                    }
                }
                await onSave(values);
                overlay.remove();
            } catch (err) {
                status.innerHTML = `<p class="status-error">ভুল হয়েছে: ${err.message}</p>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> সেভ করুন';
            }
        };
    }

    // =============================================
    // Site Config
    // =============================================
    async function loadSiteConfig() {
        const { data } = await window.supabase.from('site_config').select('*');
        if (data) {
            data.forEach(item => {
                // Replace underscores with hyphens for ID matching
                const elId = `set-${item.key.replace(/_/g, '-')}`;
                const el = document.getElementById(elId);
                if (el) el.value = item.value;
            });
        }
    }

    document.getElementById('site-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('site-save-btn');
        const status = document.getElementById('site-status');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'আপডেট হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const updates = [
                { key: 'top_notice', value: document.getElementById('set-top-notice').value },
                { key: 'phone', value: document.getElementById('set-phone').value },
                { key: 'address', value: document.getElementById('set-address').value },
                { key: 'chairman_name', value: document.getElementById('set-chairman-name').value },
                { key: 'chairman_designation', value: document.getElementById('set-chairman-designation').value },
                { key: 'chairman_message', value: document.getElementById('set-chairman-msg').value }
            ];

            const imageFile = document.getElementById('set-chairman-image').files[0];
            if (imageFile) {
                const imgUrl = await uploadImage(imageFile, 'chairman');
                updates.push({ key: 'chairman_image', value: imgUrl });
            }

            for (const up of updates) {
                if (up.value !== undefined && up.value !== '') {
                    await window.supabase.from('site_config').upsert({ key: up.key, value: up.value }, { onConflict: 'key' });
                }
            }
            status.innerHTML = '<p class="status-success"><i class="fa-solid fa-circle-check"></i> সাইট সেটিংস সফলভাবে আপডেট হয়েছে!</p>';
            setTimeout(() => status.innerHTML = '', 4000);
        } catch (err) {
            status.innerHTML = `<p class="status-error"><i class="fa-solid fa-circle-xmark"></i> ভুল হয়েছে: ${err.message}</p>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'সব তথ্য আপডেট করুন';
        }
    });

    // =============================================
    // Course Manager
    // =============================================
    async function loadCourses() {
        const list = document.getElementById('courses-list');
        list.innerHTML = '<tr><td colspan="5" style="text-align:center;">লোড হচ্ছে...</td></tr>';
        const { data } = await window.supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
            list.innerHTML = '';
            data.forEach(c => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${c.image_url}" width="60" height="45" style="border-radius:8px; object-fit:cover;"></td>
                    <td><strong>${c.title}</strong><br><small style="color:#aaa;">${c.level || ''}</small></td>
                    <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.description || '-'}</td>
                    <td>${c.price || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn-small" onclick="editCourse(${c.id}, '${encodeURIComponent(c.title)}', '${encodeURIComponent(c.description || '')}', '${encodeURIComponent(c.price || '')}', '${encodeURIComponent(c.level || '')}', '${encodeURIComponent(c.certificate_type || '')}', '${encodeURIComponent(c.syllabus || '')}')"><i class="fa-solid fa-pen"></i> এডিট</button>
                            <button class="delete-btn-small" onclick="deleteCourse(${c.id})"><i class="fa-solid fa-trash"></i> ডিলিট</button>
                        </div>
                    </td>
                `;
                list.appendChild(row);
            });
        } else {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#FFD700;">কোনো কোর্স যুক্ত করা হয়নি।</td></tr>';
        }
    }

    // Add Course via Form
    const courseForm = document.getElementById('course-upload-form');
    if (courseForm) {
        courseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('add-course-btn-submit');
            const status = document.getElementById('course-upload-status');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'আপলোড হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const title = document.getElementById('course-title').value;
                const price = document.getElementById('course-price').value;
                const description = document.getElementById('course-desc').value;
                const level = document.getElementById('course-level').value;
                const certificate_type = document.getElementById('course-cert').value;
                const syllabus = document.getElementById('course-syllabus').value;
                const imageFile = document.getElementById('course-image').files[0];

                const image_url = await uploadImage(imageFile, 'courses');

                const { error } = await window.supabase.from('courses').insert([{ title, price, description, level, certificate_type, syllabus, image_url }]);
                if (error) throw error;

                status.innerHTML = '<p class="status-success"><i class="fa-solid fa-circle-check"></i> কোর্স সফলভাবে যুক্ত হয়েছে!</p>';
                courseForm.reset();
                loadCourses();
                setTimeout(() => status.innerHTML = '', 4000);
            } catch (err) {
                status.innerHTML = `<p class="status-error"><i class="fa-solid fa-circle-xmark"></i> ভুল: ${err.message}</p>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'কোর্স যুক্ত করুন <i class="fa-solid fa-upload"></i>';
            }
        });
    }

    // Edit Course
    window.editCourse = (id, title, desc, price, level, cert, syllabus) => {
        showEditModal('কোর্স এডিট করুন', [
            { name: 'title', label: 'কোর্সের নাম', value: decodeURIComponent(title) },
            { name: 'price', label: 'কোর্স ফি', value: decodeURIComponent(price) },
            { name: 'level', label: 'কোর্স লেভেল', value: decodeURIComponent(level) },
            { name: 'cert', label: 'সার্টিফিকেট টাইপ', value: decodeURIComponent(cert) },
            { name: 'description', label: 'বর্ণনা', type: 'textarea', value: decodeURIComponent(desc) },
            { name: 'syllabus', label: 'সিলেবাস ও মডিউল', type: 'textarea', value: decodeURIComponent(syllabus) },
            { name: 'image', label: 'নতুন ছবি (ঐচ্ছিক)', type: 'file' }
        ], async (values) => {
            const updateData = { 
                title: values.title, 
                price: values.price, 
                level: values.level,
                certificate_type: values.cert,
                description: values.description,
                syllabus: values.syllabus
            };
            if (values.image) {
                updateData.image_url = await uploadImage(values.image, 'courses');
            }
            const { error } = await window.supabase.from('courses').update(updateData).eq('id', id);
            if (error) throw error;
            loadCourses();
        });
    };

    // Delete Course
    window.deleteCourse = async (id) => {
        if (confirm('আপনি কি এই কোর্সটি ডিলিট করতে চান?')) {
            await window.supabase.from('courses').delete().eq('id', id);
            loadCourses();
        }
    };

    // =============================================
    // Success Stories Manager
    // =============================================
    async function loadSuccessStories() {
        const list = document.getElementById('success-list');
        if (!list) return;
        list.innerHTML = '<tr><td colspan="5" style="text-align:center;">লোড হচ্ছে...</td></tr>';
        const { data, error } = await window.supabase.from('success_stories').select('*').order('created_at', { ascending: false });
        
        if (error || !data || data.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#FFD700;">কোনো সাকসেস স্টোরি নেই। (টেবিল তৈরি করা হয়েছে কিনা চেক করুন)</td></tr>';
            return;
        }
        
        list.innerHTML = '';
        data.forEach(s => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${s.image_url}" width="50" height="50" style="border-radius:50%; object-fit:cover;"></td>
                <td><strong>${s.name}</strong></td>
                <td>${s.batch}</td>
                <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.achievement}</td>
                <td>
                    <div class="action-btns">
                        <button class="edit-btn-small" onclick="editSuccessStory('${s.id}', '${encodeURIComponent(s.name)}', '${encodeURIComponent(s.batch)}', '${encodeURIComponent(s.achievement)}')"><i class="fa-solid fa-pen"></i> এডিট</button>
                        <button class="delete-btn-small" onclick="deleteSuccessStory('${s.id}')"><i class="fa-solid fa-trash"></i> ডিলিট</button>
                    </div>
                </td>
            `;
            list.appendChild(row);
        });
    }

    const successForm = document.getElementById('success-upload-form');
    if (successForm) {
        successForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('add-success-btn-submit');
            const status = document.getElementById('success-upload-status');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'আপলোড হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const name = document.getElementById('success-name').value;
                const batch = document.getElementById('success-batch').value;
                const achievement = document.getElementById('success-achievement').value;
                const imageFile = document.getElementById('success-image').files[0];

                const image_url = await uploadImage(imageFile, 'gallery'); // Reusing gallery bucket

                const { error } = await window.supabase.from('success_stories').insert([{ name, batch, achievement, image_url }]);
                if (error) throw error;

                status.innerHTML = '<p class="status-success"><i class="fa-solid fa-circle-check"></i> স্টোরি যুক্ত হয়েছে!</p>';
                successForm.reset();
                loadSuccessStories();
                setTimeout(() => status.innerHTML = '', 4000);
            } catch (err) {
                status.innerHTML = `<p class="status-error"><i class="fa-solid fa-circle-xmark"></i> ভুল: ${err.message}</p>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'স্টোরি যুক্ত করুন <i class="fa-solid fa-upload"></i>';
            }
        });
    }

    window.editSuccessStory = (id, name, batch, achievement) => {
        showEditModal('সাকসেস স্টোরি এডিট', [
            { name: 'name', label: 'স্টুডেন্টের নাম', value: decodeURIComponent(name) },
            { name: 'batch', label: 'ব্যাচ নম্বর', value: decodeURIComponent(batch) },
            { name: 'achievement', label: 'সাফল্যের বিবরণ', type: 'textarea', value: decodeURIComponent(achievement) },
            { name: 'image', label: 'নতুন ছবি (ঐচ্ছিক)', type: 'file' }
        ], async (values) => {
            const updateData = { name: values.name, batch: values.batch, achievement: values.achievement };
            if (values.image) {
                updateData.image_url = await uploadImage(values.image, 'gallery');
            }
            const { error } = await window.supabase.from('success_stories').update(updateData).eq('id', id);
            if (error) throw error;
            loadSuccessStories();
        });
    };

    window.deleteSuccessStory = async (id) => {
        if (confirm('স্টোরিটি ডিলিট করতে চান?')) {
            await window.supabase.from('success_stories').delete().eq('id', id);
            loadSuccessStories();
        }
    };
    
    // Call loadSuccessStories in tab click
    document.querySelectorAll('.sidebar-menu li[data-tab]').forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            if (targetTab === 'success-stories') loadSuccessStories();
        });
    });

    // =============================================
    // Instructor Manager
    // =============================================
    async function loadInstructors() {
        const list = document.getElementById('instructors-list');
        list.innerHTML = '<tr><td colspan="4" style="text-align:center;">লোড হচ্ছে...</td></tr>';
        const { data } = await window.supabase.from('instructors').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
            list.innerHTML = '';
            data.forEach(t => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${t.image_url}" width="50" height="50" style="border-radius:50%; object-fit:cover;"></td>
                    <td><strong>${t.name}</strong></td>
                    <td>${t.designation}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn-small" onclick="editInstructor(${t.id}, '${encodeURIComponent(t.name)}', '${encodeURIComponent(t.designation)}')"><i class="fa-solid fa-pen"></i> এডিট</button>
                            <button class="delete-btn-small" onclick="deleteInstructor(${t.id})"><i class="fa-solid fa-trash"></i> ডিলিট</button>
                        </div>
                    </td>
                `;
                list.appendChild(row);
            });
        } else {
            list.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#FFD700;">কোনো শিক্ষক যুক্ত করা হয়নি।</td></tr>';
        }
    }

    // Add Instructor via Form
    const instForm = document.getElementById('instructor-upload-form');
    if (instForm) {
        instForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('add-inst-btn-submit');
            const status = document.getElementById('inst-upload-status');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'আপলোড হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const name = document.getElementById('inst-name').value;
                const designation = document.getElementById('inst-designation').value;
                const imageFile = document.getElementById('inst-image').files[0];

                const image_url = await uploadImage(imageFile, 'instructors');

                const { error } = await window.supabase.from('instructors').insert([{ name, designation, image_url }]);
                if (error) throw error;

                status.innerHTML = '<p class="status-success"><i class="fa-solid fa-circle-check"></i> শিক্ষক সফলভাবে যুক্ত হয়েছেন!</p>';
                instForm.reset();
                loadInstructors();
                setTimeout(() => status.innerHTML = '', 4000);
            } catch (err) {
                status.innerHTML = `<p class="status-error"><i class="fa-solid fa-circle-xmark"></i> ভুল: ${err.message}</p>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'শিক্ষক যুক্ত করুন <i class="fa-solid fa-upload"></i>';
            }
        });
    }

    // Edit Instructor
    window.editInstructor = (id, name, designation) => {
        showEditModal('শিক্ষক এডিট করুন', [
            { name: 'name', label: 'শিক্ষকের নাম', value: decodeURIComponent(name) },
            { name: 'designation', label: 'পদবী', value: decodeURIComponent(designation) },
            { name: 'image', label: 'নতুন ছবি (ঐচ্ছিক)', type: 'file' }
        ], async (values) => {
            const updateData = { name: values.name, designation: values.designation };
            if (values.image) {
                updateData.image_url = await uploadImage(values.image, 'instructors');
            }
            const { error } = await window.supabase.from('instructors').update(updateData).eq('id', id);
            if (error) throw error;
            loadInstructors();
        });
    };

    // Delete Instructor
    window.deleteInstructor = async (id) => {
        if (confirm('আপনি কি এই শিক্ষককে ডিলিট করতে চান?')) {
            await window.supabase.from('instructors').delete().eq('id', id);
            loadInstructors();
        }
    };

    // =============================================
    // Payments Verification
    // =============================================
    async function loadPayments() {
        const listContainer = document.getElementById('admin-payments-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<tr><td colspan="7" style="text-align:center;">লোড হচ্ছে...</td></tr>';

        try {
            const { data, error } = await window.supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                listContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#FFD700;">কোনো পেমেন্ট পাওয়া যায়নি।</td></tr>';
                return;
            }

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
                    <td><span style="color:${statusColor}; font-weight:600;">${p.status.toUpperCase()}</span></td>
                    <td>
                        ${p.status === 'pending' ? `
                            <div class="action-btns">
                                <button class="edit-btn-small" style="color:#00ffa3; border-color:rgba(0,255,163,0.2); background:rgba(0,255,163,0.1);" onclick="verifyPayment(${p.id}, 'approved')"><i class="fa-solid fa-check"></i> Approve</button>
                                <button class="delete-btn-small" onclick="verifyPayment(${p.id}, 'rejected')"><i class="fa-solid fa-xmark"></i> Reject</button>
                            </div>
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
            alert('ভুল হয়েছে: ' + err.message);
        }
    };

    document.getElementById('refresh-payments').addEventListener('click', loadPayments);

    // =============================================
    // Submissions (Enrollments)
    // =============================================
    async function loadSubmissions() {
        const listContainer = document.getElementById('enrollments-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center;">তথ্য খোঁজা হচ্ছে...</td></tr>';

        try {
            const { data, error } = await window.supabase
                .from('enrollments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#FFD700;">এখনো কোনো আবেদন জমা পড়েনি।</td></tr>';
                return;
            }

            listContainer.innerHTML = '';
            data.forEach(item => {
                const date = new Date(item.created_at).toLocaleDateString('bn-BD');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${item.full_name}</strong></td>
                    <td>${item.phone}</td>
                    <td>${item.course}</td>
                    <td>${date}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn-small" onclick="viewDetails('${encodeURIComponent(item.message || 'কোনো মেসেজ নেই')}')"><i class="fa-solid fa-eye"></i> দেখুন</button>
                            <button class="delete-btn-small" onclick="deleteEnrollment(${item.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                listContainer.appendChild(row);
            });
        } catch (error) {
            console.error('Fetch Error:', error);
            listContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ff4d4d;">এরর: ${error.message}</td></tr>`;
        }
    }

    window.viewDetails = (msg) => alert('স্টুডেন্ট মেসেজ: ' + decodeURIComponent(msg));

    window.deleteEnrollment = async (id) => {
        if (!confirm('আপনি কি এই আবেদনটি মুছে ফেলতে চান?')) return;
        try {
            const { error } = await window.supabase.from('enrollments').delete().eq('id', id);
            if (error) throw error;
            loadSubmissions();
        } catch (error) {
            alert('মুছে ফেলা যায়নি: ' + error.message);
        }
    };

    const refreshBtn = document.getElementById('refresh-submissions');
    if (refreshBtn) refreshBtn.addEventListener('click', loadSubmissions);

    // =============================================
    // Gallery Manager
    // =============================================
    const galleryForm = document.getElementById('gallery-upload-form');
    if (galleryForm) {
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
                const image_url = await uploadImage(file, 'gallery');

                const { error: dbErr } = await window.supabase
                    .from('gallery_items')
                    .insert([{ title, category, image_url }]);

                if (dbErr) throw dbErr;

                status.innerHTML = '<p class="status-success"><i class="fa-solid fa-circle-check"></i> সাফল্যের সাথে আপলোড হয়েছে!</p>';
                galleryForm.reset();
                loadGallery();
                setTimeout(() => status.innerHTML = '', 4000);
            } catch (err) {
                status.innerHTML = `<p class="status-error"><i class="fa-solid fa-circle-xmark"></i> ভুল: ${err.message}</p>`;
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = 'আপলোড করুন <i class="fa-solid fa-upload"></i>';
            }
        });
    }

    async function loadGallery() {
        const galleryGrid = document.getElementById('admin-gallery-list');
        if (!galleryGrid) return;

        try {
            const { data, error } = await window.supabase
                .from('gallery_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            galleryGrid.innerHTML = '';
            if (!data || data.length === 0) {
                galleryGrid.innerHTML = '<p style="color:#FFD700; text-align:center; padding:30px;">গ্যালারিতে কোনো ছবি নেই।</p>';
                return;
            }

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'admin-gallery-item';
                card.innerHTML = `
                    <img src="${item.image_url}" alt="${item.title}">
                    <div class="gallery-item-title">${item.title}</div>
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

    // ============================================
    // CERTIFICATE MANAGER
    // ============================================
    const certForm = document.getElementById('certificate-form');
    if (certForm) {
        certForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('add-cert-btn-submit');
            const status = document.getElementById('cert-status');

            const certData = {
                student_name: document.getElementById('cert-student-name').value,
                course_name: document.getElementById('cert-course-name').value,
                certificate_id: document.getElementById('cert-id').value,
                issue_date: document.getElementById('cert-issue-date').value,
                grade: document.getElementById('cert-grade').value
            };

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'যুক্ত হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';

                const { error } = await window.supabase.from('certificates').insert([certData]);
                if (error) {
                    if (error.code === '23505') throw new Error('এই সার্টিফিকেট আইডিটি ইতোমধ্যে আছে!');
                    throw error;
                }

                status.innerHTML = '<p class="status-success"><i class="fa-solid fa-circle-check"></i> সফলভাবে সার্টিফিকেট ইস্যু হয়েছে!</p>';
                certForm.reset();
                loadCertificates();
                setTimeout(() => status.innerHTML = '', 4000);
            } catch (err) {
                status.innerHTML = `<p class="status-error"><i class="fa-solid fa-circle-xmark"></i> ভুল: ${err.message}</p>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'সার্টিফিকেট যুক্ত করুন <i class="fa-solid fa-plus"></i>';
            }
        });
    }

    async function loadCertificates() {
        const tbody = document.getElementById('certificates-list');
        if (!tbody) return;

        const { data, error } = await window.supabase
            .from('certificates')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && data.length > 0) {
            tbody.innerHTML = '';
            data.forEach(cert => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="color:#00d4ff; font-weight:bold;">${cert.certificate_id}</td>
                    <td>${cert.student_name}</td>
                    <td>${cert.course_name}</td>
                    <td>${cert.issue_date}</td>
                    <td><span class="status-badge" style="background:rgba(255,215,0,0.2); color:#FFD700;">${cert.grade}</span></td>
                    <td>
                        <button class="delete-btn" onclick="deleteCertificate('${cert.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">কোনো সার্টিফিকেট পাওয়া যায়নি।</td></tr>';
        }
    }

    window.deleteCertificate = async (id) => {
        if (!confirm('আপনি কি এই সার্টিফিকেট মুছে ফেলতে চান?')) return;
        await window.supabase.from('certificates').delete().eq('id', id);
        loadCertificates();
    };

    // Load initial data
    loadCertificates();
});
