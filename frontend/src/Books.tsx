import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Needed for accordion/toast behavior

interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

interface CartItem extends Book {
  quantity: number;
}

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = sessionStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedCategory = sessionStorage.getItem("lastCategory");
    const savedPage = sessionStorage.getItem("lastPage");

    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedPage) setCurrentPage(parseInt(savedPage));

    fetch("https://localhost:7070/api/books")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch books");
        return response.json();
      })
      .then((data: Book[]) => {
        setBooks(data);
        const uniqueCategories = ["All", ...Array.from(new Set(data.map((book) => book.category)))];
        setCategories(uniqueCategories);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load books");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (book: Book) => {
    sessionStorage.setItem("lastCategory", selectedCategory);
    sessionStorage.setItem("lastPage", currentPage.toString());

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.bookID === book.bookID);
      let updatedCart;
      if (existing) {
        updatedCart = prevCart.map((item) =>
          item.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...prevCart, { ...book, quantity: 1 }];
      }
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    // Show Toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (loading) return <p className="text-center mt-4">Loading books...</p>;
  if (error) return <p className="text-center text-danger mt-4">{error}</p>;

  const filteredBooks = selectedCategory === "All"
    ? books
    : books.filter((book) => book.category === selectedCategory);

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    return sortOrder === "asc"
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title);
  });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 fw-bold">Online Bookstore</h1>

      <div className="row">
        {/* Sidebar: Filters, Sort, Cart Summary */}
        <div className="col-md-4 mb-4">
          {/* Accordion - New Bootstrap Feature */}
          <div className="accordion" id="filterAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                >
                  Filters & Sorting
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse show"
                data-bs-parent="#filterAccordion"
              >
                <div className="accordion-body">
                  {/* Category Filter */}
                  <label className="fw-bold">Filter by Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="form-select mb-3"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {/* Sort Button */}
                  <button
                    className="btn btn-dark w-100"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    Sort by Title ({sortOrder === "asc" ? "A-Z" : "Z-A"})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="card mt-4">
            <div className="card-body text-center">
              <h5 className="fw-bold">🛒 Cart Summary</h5>
              <p>{totalItems} item(s)</p>
              <p>Total: ${totalPrice.toFixed(2)}</p>
              <Link to="/cart" className="btn btn-outline-primary btn-sm">
                View Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content: Book Table */}
        <div className="col-md-8">
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-center">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Pages</th>
                  <th>Price ($)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBooks.map((book) => (
                  <tr key={book.bookID}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category}</td>
                    <td>{book.pageCount}</td>
                    <td>${book.price.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAddToCart(book)}
                      >
                        Add to Cart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              className="btn btn-outline-primary px-3"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="fw-bold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-outline-primary px-3"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="text-center mt-4">
            <label className="fw-bold me-2">Books per page:</label>
            <select
              value={booksPerPage}
              onChange={(e) => setBooksPerPage(parseInt(e.target.value))}
              className="form-select d-inline-block w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toast - New Bootstrap Feature */}
      <div
        className={`toast-container position-fixed bottom-0 end-0 p-3`}
        style={{ zIndex: 9999 }}
      >
        <div className={`toast align-items-center text-bg-success ${showToast ? "show" : ""}`} role="alert">
          <div className="d-flex">
            <div className="toast-body">
              ✅ Book added to cart!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;
