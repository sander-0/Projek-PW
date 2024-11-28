let editingIndex = null;

console.log('Token saved to localStorage:', localStorage.getItem('authToken'));

function loadMenuItems() {
    const menuItemsList = document.getElementById('menuItemsList');
    menuItemsList.innerHTML = '';

    // Fetch menu items from the backend
    fetch('http://localhost:3000/menu/products')
        .then(response => response.json())
        .then(data => {
            if (data.message === "Success get all products" && Array.isArray(data.data)) {
                const menuItems = data.data;
                menuItems.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item');
                    itemDiv.innerHTML = `
                        <img src="${item.images}" alt="${item.name}">
                        <div class="item-info">
                            <h6>${item.category}</h6>
                            <h5>${item.name}</h5>
                            <p>Price: $${item.price.toFixed(2)}</p>
                            <p class="item-description">${item.description}</p>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn" onclick="editMenuItem('${item._id}')">Edit</button>
                            <button class="delete-btn" onclick="deleteMenuItem('${item._id}')">Delete</button>
                        </div>
                    `;
                    menuItemsList.appendChild(itemDiv);
                });
            } else {
                console.error('Invalid response structure:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching menu items:', error);
        });
}

function showOrderList() {
    alert('This will show the list of orders in the future.');
}

function scrollToOrderForm() {
    // Simpan status di sessionStorage
    sessionStorage.setItem("scrollToOrderForm", "true");

    // Refresh halaman
    location.reload();
}

// Event listener untuk menangani setelah refresh
document.addEventListener("DOMContentLoaded", () => {
    const shouldScroll = sessionStorage.getItem("scrollToOrderForm");

    if (shouldScroll === "true") {
        // Hapus status agar tidak scroll berulang kali
        sessionStorage.removeItem("scrollToOrderForm");

        // Tunggu sedikit sebelum scroll
        setTimeout(() => {
            const orderForm = document.querySelector(".order-form");
            if (orderForm) {
                orderForm.scrollIntoView({ behavior: "smooth" });
            }
        }, 500); // Adjust delay as needed
    }
});

function handleSubmit() {
    if (editingIndex !== null) {
        updateMenuItem(editingIndex);
    } else {
        addMenuItem();
    }
}

async function addMenuItem() {
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const images = document.getElementById('itemImage').value;
    const description = document.getElementById('itemDescription').value;

    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You must be logged in to add a menu item.');
        return;
    }

    try {
        // Kirim data ke backend menggunakan method POST
        const response = await fetch('http://localhost:3000/menu/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Tambahkan token di header
            },
            body: JSON.stringify({ name, category, price, images, description })
        });

        // Cek response dari server
        const data = await response.json();

        if (response.ok) {
            alert('Menu item added successfully!');
            loadMenuItems(); // Perbarui menu setelah item ditambahkan
            resetForm(); // Reset form input
        } else {
            alert(data.message || 'Failed to add menu item. Please try again.');
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
        alert('An error occurred. Please try again.');
    }
}

async function updateMenuItem() {
    // Ambil data dari form
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const images = document.getElementById('itemImage').value;
    const description = document.getElementById('itemDescription').value;

    // Ambil token untuk autentikasi
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You must be logged in to update a menu item.');
        return;
    }

    try {
        // Kirim permintaan PUT untuk memperbarui item menu
        const response = await fetch(`http://localhost:3000/menu/products/${editingIndex}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token untuk autentikasi
            },
            body: JSON.stringify({ name, category, price, images, description }) // Data yang akan diupdate
        });

        const data = await response.json();

        if (response.ok) {
            alert('Menu item updated successfully!');
            loadMenuItems(); // Perbarui tampilan menu setelah item diperbarui
            resetForm(); // Reset form input setelah update
        } else {
            alert(data.message || 'Failed to update menu item. Please try again.');
        }
    } catch (error) {
        console.error('Error updating menu item:', error);
        alert('An error occurred while updating the item. Please try again.');
    }
}

async function deleteMenuItem(itemId) {
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You must be logged in to delete a menu item.');
        return;
    }

    try {
        // Kirim permintaan DELETE ke backend
        const response = await fetch(`http://localhost:3000/menu/products/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Tambahkan token di header
            }
        });

        // Cek respons dari server
        const data = await response.json();

        if (response.ok) {
            alert('Menu item deleted successfully!');
            loadMenuItems(); // Perbarui daftar menu setelah item dihapus
        } else {
            alert(data.message || 'Failed to delete menu item. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('An error occurred. Please try again.');
    }
}

function editMenuItem(itemId) {
    console.log("Editing item with ID:", itemId); // Debugging untuk memastikan ID benar

    // Ambil data menu berdasarkan ID
    fetch(`http://localhost:3000/menu/products/${itemId}`)
        .then(response => response.json())
        .then(responseData => {
            console.log('Response data received:', responseData); // Debugging untuk melihat data yang diterima

            if (responseData.message === "Success get one product" && responseData.data) {
                const data = responseData.data; // Ambil detail item menu dari properti `data`

                // Isi form dengan data dari backend
                document.getElementById('itemName').value = data.name || ""; 
                document.getElementById('itemCategory').value = data.category || ""; 
                document.getElementById('itemPrice').value = data.price || ""; 
                document.getElementById('itemImage').value = data.images || ""; 
                document.getElementById('itemDescription').value = data.description || ""; 

                // Ubah tombol submit menjadi "Update Item"
                document.getElementById('submitButton').innerText = 'Update Item';

                // Set `editingIndex` ke ID item yang sedang diedit
                editingIndex = itemId;
            } else {
                console.error('Data menu tidak ditemukan atau struktur data tidak sesuai.');
                alert('Menu item tidak ditemukan!');
            }
        })
        .catch(error => {
            console.error('Error fetching menu item:', error);
            alert('Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
        });
}


function resetForm() {
    editingIndex = null;
    document.getElementById('menuItemForm').reset();
    document.getElementById('submitButton').innerText = 'Add Item';
}

document.getElementById('signOutBtn').addEventListener('click', function () {
    // Hapus token dari localStorage
    localStorage.removeItem('authToken');
    // Arahkan ke halaman index.html
    window.location.href = 'index.html';
});

// Initialize and load menu items from backend
loadMenuItems();
