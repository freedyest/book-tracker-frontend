const BACKEND_URL = 'https://fceb5d07-69eb-446f-8b29-0ba4a2d76f95-00-1usntt1kgekqz.pike.replit.dev';

const Blist = document.getElementById('Blist');
const addModal = document.getElementById('addModal');
const addBtn = document.getElementById('addBtn');

// Fungsi buka/tutup modal
function openAddModal() {
  addModal.classList.remove('hidden');
}
function closeAddModal() {
  addModal.classList.add('hidden');
  document.getElementById('Bform').reset();
}

addBtn.addEventListener('click', openAddModal);

// Load semua buku
function loadBooks() {
  fetch(`${BACKEND_URL}/api/books`)
    .then(res => {
      if (!res.ok) throw new Error('Gagal fetch');
      return res.json();
    })
    .then(data => {
      Blist.innerHTML = '';
      data.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
          <img src="${book.coverUrl}" alt="Sampul" />
          <h3>${book.title}</h3>
          <p>${book.author}</p>
        `;
        Blist.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Gagal memuat buku:', err);
    });
}

// Submit form tambah buku
document.getElementById('Bform').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const coverUrlInput = document.getElementById('coverUrl').value.trim();
  const coverFile = document.getElementById('coverFile').files[0];

  const submitBook = (coverUrl) => {
    fetch(`${BACKEND_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, coverUrl })
    })
      .then(res => {
        if (!res.ok) throw new Error('Gagal menambahkan buku');
        return res.json();
      })
      .then(() => {
        closeAddModal();
        loadBooks();
      })
      .catch(err => console.error(err));
  };

  if (coverFile) {
    const reader = new FileReader();
    reader.onload = () => {
      submitBook(reader.result); // Base64
    };
    reader.readAsDataURL(coverFile);
  } else {
    submitBook(coverUrlInput);
  }
});

document.addEventListener('DOMContentLoaded', loadBooks);
