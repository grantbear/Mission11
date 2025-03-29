import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Book {
  bookID: number;
  title: string;
  price: number;
}

interface CartItem extends Book {
  quantity: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = sessionStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const updateQuantity = (bookID: number, quantity: number) => {
    const updated = cartItems.map((item) =>
      item.bookID === bookID ? { ...item, quantity } : item
    );
    setCartItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (bookID: number) => {
    const updated = cartItems.filter((item) => item.bookID !== bookID);
    setCartItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const continueShopping = () => {
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 fw-bold">Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <>
          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Quantity</th>
                <th>Price ($)</th>
                <th>Subtotal ($)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.bookID}>
                  <td>{item.title}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.quantity}
                      min={1}
                      onChange={(e) =>
                        updateQuantity(item.bookID, parseInt(e.target.value))
                      }
                    />
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(item.bookID)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end fw-bold mb-4">
            Total: ${total.toFixed(2)}
          </div>

          <div className="text-center">
            <button className="btn btn-outline-primary" onClick={continueShopping}>
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
