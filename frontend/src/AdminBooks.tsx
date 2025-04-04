import React, { useEffect, useState } from "react";

interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  category: string;
  pageCount: number;
  price: number;
}

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<Book, 'bookID'>>({
    title: '',
    author: '',
    publisher: '',
    category: '',
    pageCount: 0,
    price: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookData, setNewBookData] = useState<Omit<Book, 'bookID'>>({
    title: '',
    author: '',
    publisher: '',
    category: '',
    pageCount: 0,
    price: 0,
  });

  const fetchBooks = async () => {
    try {
      const response = await fetch("https://mission13bearbackend-ahfeejffc2e0f3fb.eastus-01.azurewebsites.net/api/books");
      if (!response.ok) throw new Error("Failed to fetch books");
      const data: Book[] = await response.json();
      setBooks(data);
      const uniqueCategories = [...new Set(data.map((b) => b.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (bookId: number) => {
    try {
      const response = await fetch(`https://mission13bearbackend-ahfeejffc2e0f3fb.eastus-01.azurewebsites.net/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete the book');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'pageCount' ? parseFloat(value) : value,
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const response = await fetch(`https://mission13bearbackend-ahfeejffc2e0f3fb.eastus-01.azurewebsites.net/api/books/${editingBook.bookID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BookID: editingBook.bookID,
          Title: editFormData.title,
          Author: editFormData.author,
          Publisher: editFormData.publisher,
          Category: editFormData.category,
          PageCount: editFormData.pageCount,
          Price: editFormData.price,
          ISBN: "0000000000", // Default/fake
          Classification: "General", // Default/fake
        }),
      });

      if (!response.ok) throw new Error('Failed to update book');

      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleNewBookInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBookData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'pageCount' ? parseFloat(value) : value,
    }));
  };

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://mission13bearbackend-ahfeejffc2e0f3fb.eastus-01.azurewebsites.net/api/books", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Title: newBookData.title,
          Author: newBookData.author,
          Publisher: newBookData.publisher,
          Category: newBookData.category,
          PageCount: newBookData.pageCount,
          Price: newBookData.price,
          ISBN: "0000000000", // Default/fake
          Classification: "General", // Default/fake
        }),
      });

      if (!response.ok) throw new Error('Failed to add book');

      setNewBookData({
        title: '',
        author: '',
        publisher: '',
        category: '',
        pageCount: 0,
        price: 0,
      });

      setShowAddForm(false);
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Admin Book List</h1>

      <div className="text-center mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? 'Cancel' : '➕ Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBookSubmit} className="mb-5 p-4 border rounded shadow-sm bg-light">
          <h4 className="mb-3">Add a New Book</h4>

          <div className="mb-2">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              type="text"
              name="title"
              value={newBookData.title}
              onChange={handleNewBookInputChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Author</label>
            <input
              className="form-control"
              type="text"
              name="author"
              value={newBookData.author}
              onChange={handleNewBookInputChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Publisher</label>
            <input
              className="form-control"
              type="text"
              name="publisher"
              value={newBookData.publisher}
              onChange={handleNewBookInputChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category"
              value={newBookData.category}
              onChange={handleNewBookInputChange}
              required
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="form-label">Page Count</label>
            <input
              className="form-control"
              type="number"
              name="pageCount"
              value={newBookData.pageCount}
              onChange={handleNewBookInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              className="form-control"
              type="number"
              name="price"
              value={newBookData.price}
              onChange={handleNewBookInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-success">📘 Add Book</button>
        </form>
      )}

      {editingBook && (
        <form onSubmit={handleUpdateSubmit} className="mb-5 p-4 border rounded shadow-sm bg-light">
          <h4 className="mb-3">Editing: {editingBook.title}</h4>

          {(['title', 'author', 'publisher'] as const).map((field) => (
            <div className="mb-2" key={field}>
              <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className="form-control"
                type="text"
                name={field}
                value={(editFormData as any)[field]}
                onChange={handleEditInputChange}
                required
              />
            </div>
          ))}

          <div className="mb-2">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category"
              value={editFormData.category}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="form-label">Page Count</label>
            <input
              className="form-control"
              type="number"
              name="pageCount"
              value={editFormData.pageCount}
              onChange={handleEditInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              className="form-control"
              type="number"
              name="price"
              value={editFormData.price}
              onChange={handleEditInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-success me-2">💾 Save</button>
          <button type="button" onClick={() => setEditingBook(null)} className="btn btn-secondary">Cancel</button>
        </form>
      )}

      {books.length === 0 ? (
        <p className="text-center text-gray-600">No books found.</p>
      ) : (
        <ul className="space-y-4">
          {books.map((book) => (
            <li key={book.bookID} className="flex justify-between items-start p-4 border rounded shadow-sm bg-white">
              <div className="flex-1">
                <p className="text-lg font-semibold">{book.title}</p>
                <p className="text-sm text-gray-700">
                  by {book.author} • ${book.price.toFixed(2)} • {book.category}
                </p>
              </div>
              <div className="btn-group">
                <button
                  onClick={() => handleEdit(book)}
                  className="btn btn-sm btn-outline-warning"
                  title="Edit this book"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(book.bookID)}
                  className="btn btn-sm btn-outline-danger"
                  title="Delete this book"
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminBooks;
