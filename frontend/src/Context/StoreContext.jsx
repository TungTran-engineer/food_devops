import { createContext, useEffect, useState } from "react";
import { food_list as foodListAssets, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000"; // URL backend
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  // 🛒 Thêm vào giỏ hàng
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };

  // 🛒 Xóa khỏi giỏ hàng
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  // 💰 Tính tổng giá trị giỏ hàng
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // 📥 Lấy danh sách món ăn từ backend
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (err) {
      console.error("❌ Lỗi fetch food list:", err);
    }
  };

  // 📥 Load giỏ hàng user
  const loadCartData = async (tk) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token: tk } }
      );
      setCartItems(response.data.cartData);
    } catch (err) {
      console.error("❌ Lỗi load cart:", err);
    }
  };

  // 📥 Lấy profile user
  const fetchUserProfile = async (tk) => {
    try {
      const res = await axios.get(url + "/api/user/profile", {
        headers: { Authorization: `Bearer ${tk}` },
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user)); // ✅ lưu vào localStorage
      }
    } catch (err) {
      console.error("❌ Fetch profile error:", err);
    }
  };

  // 🚀 Khi load app
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      if (token) {
        await loadCartData(token);
        await fetchUserProfile(token);
      }
    }
    loadData();
  }, [token]);

  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    loadCartData,
    setCartItems,
    user,
    setUser, // 🆕 để Profile cập nhật avatar xong push lên Navbar
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
