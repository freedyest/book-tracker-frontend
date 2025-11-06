let currentBookIndex = 0;
let booksData = [];
let currentLayout = 'grid';
const BACKEND_URL = 'https://book-tracker-backend-freedyjob.replit.app';
const Blist = document.getElementById('Blist');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const searchInput = document.getElementById('searchInput');

function createBookElement(book) {
    const div = document.createElement('div');
    div.className = 'book';

    const img = book.coverUrl ? `<img src="${book.coverUrl}" alt="${book.title}" />` : '';
    const startText = book.startdate
        ? `<p class="start" style="color:gray;">📘 Mulai dibaca: ${new Date(book.startdate).toLocaleString()}</p>` : '';

    const finishText = book.isFinished
        ? `<p class="finish" style="color:green;">✅ Selesai dibaca: ${new Date(book.finishDate).toLocaleString()}</p>
           <button class="toggle-finish" data-id="${book._id}" data-status="false">Batal Tandai Dibaca</button>`
        : `<button class="toggle-finish" data-id="${book._id}" data-status="true">Tandai Selesai Dibaca</button>`;

    div.innerHTML = `
        ${img}
        <h3>${book.title}</h3>
        <p>Penulis: ${book.author}</p>
        ${startText}
        ${finishText}
        <button class="edit-btn" data-id="${book._id}">Edit</button>
        <button class="delete-btn" data-id="${book._id}">Hapus</button>
    `;

    return div;
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}
const addForm = document.getElementById('Bform');

addForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const coverUrlInput = document.getElementById('coverUrl').value.trim();
  const coverFile = document.getElementById('coverFile').files[0];

  const handleSubmit = (coverUrl) => {
    fetch(`${BACKEND_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, coverUrl }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal menambahkan buku');
        return res.json();
      })
      .then(() => {
        closeAddModal();
        loadBooks();
        addForm.reset();
        document.getElementById("previewImage").style.display = "none";
      })
      .catch((err) => {
        console.error('❌ Error tambah buku:', err);
        alert('Gagal menambahkan buku');
      });
  };

  if (!title || !author) {
    alert("Judul dan Penulis wajib diisi!");
    return;
  }

  if (coverFile) {
    const reader = new FileReader();
    reader.onload = () => handleSubmit(reader.result);
    reader.readAsDataURL(coverFile);
  } else {
    handleSubmit(coverUrlInput || '');
  }
});

document.getElementById("coverFile").addEventListener("change", function (e) {
    const reader = new FileReader();
    reader.onload = function () {
        const img = document.getElementById("previewImage");
        img.src = reader.result;
        img.style.display = "block";
    };
    if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});

function renderBooks(data = booksData) {
    Blist.innerHTML = '';
    if (currentLayout === 'full') {
        const book = data[currentBookIndex];
        Blist.appendChild(createBookElement(book));
    } else {
        data.forEach(book => {
            Blist.appendChild(createBookElement(book));
        });
    }
    updateNavigation(data);
}

function updateNavigation(data = booksData) {
    if (currentLayout === 'full') {
        prevBtn.style.display = nextBtn.style.display = 'inline-block';
        prevBtn.disabled = currentBookIndex <= 0;
        nextBtn.disabled = currentBookIndex >= data.length - 1;
    } else {
        prevBtn.style.display = nextBtn.style.display = 'none';
    }
}

function loadBooks() {
    fetch(`${BACKEND_URL}/api/books`)
        .then(res => res.json())
        .then(data => {
            booksData = data;
            currentBookIndex = 0;
            setLayout('grid');
            renderBooks();
        })
        .catch(err => console.error('Gagal memuat buku:', err));
}

function toggleFinishStatus(bookId, status) {
    fetch(`${BACKEND_URL}/api/books/${bookId}/finish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFinished: status }),
    })
        .then(() => loadBooks())
        .catch(err => console.error('Gagal ubah status:', err));
}

function showEditForm(bookId) {
    fetch(`${BACKEND_URL}/api/books/${bookId}`)
        .then(res => res.json())
        .then(book => {
            editForm['editTitle'].value = book.title;
            editForm['editAuthor'].value = book.author;
            editForm['editCoverUrl'].value = book.coverUrl || '';
            editForm.setAttribute('data-edit-id', book._id);
            editModal.style.display = 'flex';
        })
        .catch(err => console.error('Gagal ambil data buku:', err));
}

function updateBook(bookId, bookData) {
    fetch(`${BACKEND_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
    })
        .then(() => loadBooks())
        .catch(err => console.error('Gagal update buku:', err));
}

function deleteBook(bookId) {
    if (confirm('Yakin ingin menghapus buku ini?')) {
        fetch(`${BACKEND_URL}/api/books/${bookId}`, {
            method: 'DELETE',
        })
            .then(() => loadBooks())
            .catch(err => console.error('Gagal hapus buku:', err));
    }
}

function setLayout(mode) {
    currentLayout = mode;
    Blist.className = 'Blist ' + mode;
    currentBookIndex = 0;
    renderBooks();
}

function navigateBook(direction) {
    if (currentLayout !== 'full') return;
    currentBookIndex = Math.max(0, Math.min(booksData.length - 1, currentBookIndex + direction));
    renderBooks();
}

function closeEditModal() {
    editModal.style.display = 'none';
}

// FITUR PENCARIAN
searchInput.addEventListener('input', function (e) {
    const keyword = e.target.value.toLowerCase();
    const filteredBooks = booksData.filter(book =>
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword)
    );
    if (currentLayout === 'full') setLayout('grid');
    renderBooks(filteredBooks);
});

// INISIALISASI
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

    document.getElementById('openAddModal').addEventListener('click', openAddModal);

    document.querySelectorAll('[data-layout]').forEach(button => {
        button.addEventListener('click', () => setLayout(button.dataset.layout));
    });

    prevBtn.addEventListener('click', () => navigateBook(-1));
    nextBtn.addEventListener('click', () => navigateBook(1));

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = editForm['editTitle'].value;
        const author = editForm['editAuthor'].value;
        const coverUrlInput = editForm['editCoverUrl'].value;
        const coverFile = editForm['editCoverFile'].files[0];
        const bookId = editForm.getAttribute('data-edit-id');

        const handleSubmit = (coverUrl) => {
            updateBook(bookId, { title, author, coverUrl });
            closeEditModal();
        };

        if (coverFile) {
            const reader = new FileReader();
            reader.onload = () => handleSubmit(reader.result);
            reader.readAsDataURL(coverFile);
        } else {
            handleSubmit(coverUrlInput.trim());
        }
    });

    // Menangani klik pada elemen buku
    Blist.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (currentLayout === 'grid' && target.closest('.book')) {
            const bookDiv = target.closest('.book');

            if (!target.classList.contains('toggle-finish') &&
                !target.classList.contains('edit-btn') &&
                !target.classList.contains('delete-btn')) {
                bookDiv.classList.toggle('expanded');
            }
        }

        if (target.classList.contains('toggle-finish')) {
            const newStatus = target.dataset.status === 'true';
            toggleFinishStatus(id, newStatus);
        }

        if (target.classList.contains('edit-btn')) {
            showEditForm(id);
        }

        if (target.classList.contains('delete-btn')) {
            deleteBook(id);
        }
    });
});
