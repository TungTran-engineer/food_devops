import { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import { StoreContext } from "../../Context/StoreContext";

const Profile = () => {
  const { user, setUser, url, token } = useContext(StoreContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // khi vào profile thì fill data từ user context
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  // cleanup URL preview
  useEffect(() => {
    if (avatarFile) {
      const urlPreview = URL.createObjectURL(avatarFile);
      setPreviewUrl(urlPreview);
      return () => URL.revokeObjectURL(urlPreview);
    } else {
      setPreviewUrl(null);
    }
  }, [avatarFile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token) return;

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    if (avatarFile) {
      formDataToSend.append("avatar", avatarFile);
    }

    try {
      const res = await axios.put(`${url}/api/user/profile`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        setUser(res.data.user); // cập nhật user trong StoreContext
        setEditMode(false);
        setAvatarFile(null);
      }
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      setError("Failed to update profile");
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">Error: {error}</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Thông tin cá nhân</h2>
      <div className="profile-card">
        <div className="profile-avatar">
          <label htmlFor="avatarInput" className="avatar-label">
            {previewUrl ? (
              <img src={previewUrl} alt="preview avatar" />
            ) : user?.avatar ? (
              <img src={`${url}${user.avatar}`} alt="avatar" />
            ) : (
              <div className="profile-avatar placeholder">No Avatar</div>
            )}
          </label>

          {editMode && (
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />
          )}
        </div>

        <div className="profile-info">
          {editMode ? (
            <form onSubmit={handleUpdate}>
              <p>
                <strong>Tên:</strong>{" "}
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </p>
              <button type="submit" className="profile-update-btn">
                Lưu thay đổi
              </button>
              <button
                type="button"
                className="profile-update-btn cancel"
                onClick={() => setEditMode(false)}
              >
                Hủy
              </button>
            </form>
          ) : (
            <>
              <p>
                <strong>Tên:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {user?.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {user?.address}
              </p>
              <button
                className="profile-update-btn"
                onClick={() => setEditMode(true)}
              >
                Cập nhật thông tin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
