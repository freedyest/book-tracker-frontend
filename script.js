let booksData = [];
let currentLayout = 'grid';

const BACKEND_URL = 'https://fceb5d07-69eb-446f-8b29-0ba4a2d76f95-00-1usntt1kgekqz.pike.repl.co';

const Blist = document.getElementById('Blist');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
@@ -79,19 +81,19 @@
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
@@ -101,7 +103,7 @@
}

function showEditForm(bookId) {
    fetch(`${BACKEND_URL}/api/books/${bookId}`)
        .then(res => res.json())
        .then(book => {
            editForm['editTitle'].value = book.title;
@@ -114,7 +116,7 @@
}

function updateBook(bookId, bookData) {
    fetch(`${BACKEND_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
@@ -125,7 +127,7 @@

function deleteBook(bookId) {
    if (confirm('Yakin ingin menghapus buku ini?')) {
        fetch(`${BACKEND_URL}/api/books/${bookId}`, {
            method: 'DELETE',
        })
            .then(() => loadBooks())
@@ -150,7 +152,6 @@
    editModal.style.display = 'none';
}


searchInput.addEventListener('input', function (e) {
    const keyword = e.target.value.toLowerCase();
    const filteredBooks = booksData.filter(book =>
@@ -161,7 +162,6 @@
    renderBooks(filteredBooks);
});


document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

@@ -196,34 +196,30 @@
        }
    });


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
