// Admin Dashboard Logic
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
            if (targetTab === 'gallery-manager') loadGallery();
        });
    });

    // --- Submissions Logic ---
    async function loadSubmissions() {
        const listContainer = document.getElementById('enrollments-list');
        listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center;">লোড হচ্ছে...</td></tr>';

        const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            listContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">তথ্য লোড করা যায়নি।</td></tr>';
            return;
        }

        listContainer.innerHTML = '';
        data.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString('bn-BD');
            listContainer.innerHTML += `
                <tr>
                    <td>${item.full_name}</td>
                    <td>${item.phone}</td>
                    <td>${item.course}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn-secondary" onclick="alert('বার্তা: ${item.message || 'নেই'}')">বিস্তারিত</button>
                    </td>
                </tr>
            `;
        });
    }

    document.getElementById('refresh-submissions').addEventListener('click', loadSubmissions);

    // --- Gallery Logic ---
    const galleryForm = document.getElementById('gallery-upload-form');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');

    galleryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('img-title').value;
        const category = document.getElementById('img-category').value;
        const file = document.getElementById('img-file').files[0];

        if (!file) return;

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = 'আপলোড হচ্ছে... <i class="fa-solid fa-spinner fa-spin"></i>';
        uploadStatus.innerHTML = '';

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `gallery/${fileName}`;

            const { data: storageData, error: storageError } = await window.supabase.storage
                .from('wingsfly-gallery')
                .upload(filePath, file);

            if (storageError) throw storageError;

            // 2. Get Public URL
            const { data: { publicUrl } } = window.supabase.storage
                .from('wingsfly-gallery')
                .getPublicUrl(filePath);

            // 3. Save to Database Table
            const { error: dbError } = await window.supabase
                .from('gallery_items')
                .insert([{ title, category, image_url: publicUrl }]);

            if (dbError) throw dbError;

            uploadStatus.innerHTML = '<p style="color:#00ffa3;">সাফল্যের সাথে আপলোড হয়েছে!</p>';
            galleryForm.reset();
            loadGallery();
        } catch (error) {
            console.error(error);
            uploadStatus.innerHTML = `<p style="color:#ff4d4d;">ভুল হয়েছে: ${error.message}</p>`;
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = 'আপলোড করুন <i class="fa-solid fa-upload"></i>';
        }
    });

    async function loadGallery() {
        const galleryGrid = document.getElementById('admin-gallery-list');
        galleryGrid.innerHTML = '<p>লোড হচ্ছে...</p>';

        const { data, error } = await supabase
            .from('gallery_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        galleryGrid.innerHTML = '';
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'admin-gallery-item';
            card.innerHTML = `
                <img src="${item.image_url}" alt="${item.title}">
                <button class="delete-btn" data-id="${item.id}" data-url="${item.image_url}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            galleryGrid.appendChild(card);
        });

        // Add Delete Listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('আপনি কি এই ছবিটি ডিলিট করতে চান?')) return;
                
                const id = btn.getAttribute('data-id');
                const url = btn.getAttribute('data-url');
                const path = url.split('/').pop();

                // Delete from DB
                await supabase.from('gallery_items').delete().eq('id', id);
                
                // Delete from Storage (Optional but good)
                // await supabase.storage.from('wingsfly-gallery').remove([`gallery/${path}`]);

                loadGallery();
            });
        });
    }
});
