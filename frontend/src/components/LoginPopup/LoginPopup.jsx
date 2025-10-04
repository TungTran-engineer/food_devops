import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {
    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Sign Up");

    const [data, setData] = useState({
        avatar: null,
        name: "",
        email: "",
        password: "",   // file ảnh
        phone: "",
        address: ""
    });

    const onChangeHandler = (event) => {
        const { name, value, files } = event.target;

        if (name === "avatar") {
            setData(prev => ({ ...prev, avatar: files[0] })) // lưu file
        } else {
            setData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleResponse = (response) => {
        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            loadCartData({ token: response.data.token });
            setShowLogin(false);
        } else {
            toast.error(response.data.message);
        }
    }

    const onLogin = async (e) => {
        e.preventDefault();
        let new_url = url;

        try {
            if (currState === "Login") {
                // login: chỉ gửi json
                new_url += "/api/user/login";
                const response = await axios.post(new_url, {
                    email: data.email,
                    password: data.password
                });
                handleResponse(response);
            } else {
                // register: gửi form-data (có file)
                new_url += "/api/user/register";

                const formData = new FormData();
                formData.append("name", data.name);
                formData.append("email", data.email);
                formData.append("password", data.password);
                if (data.avatar) formData.append("avatar", data.avatar);
                formData.append("phone", data.phone);
                formData.append("address", data.address);

                const response = await axios.post(new_url, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                handleResponse(response);
            }
        } catch (err) {
            toast.error("Error connecting to server");
            console.error(err);
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img
                        onClick={() => setShowLogin(false)}
                        src={assets.cross_icon}
                        alt="close"
                    />
                </div>

                <div className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <>
                            <input
                                name='name'
                                onChange={onChangeHandler}
                                value={data.name}
                                type="text"
                                placeholder='Your name'
                                required
                            />
                            <input
                                name='avatar'
                                onChange={onChangeHandler}
                                type="file"
                                accept="image/*"
                            />
                            <input
                                name='phone'
                                onChange={onChangeHandler}
                                value={data.phone}
                                type="text"
                                placeholder='Phone number'
                            />
                            <input
                                name='address'
                                onChange={onChangeHandler}
                                value={data.address}
                                type="text"
                                placeholder='Address'
                            />
                        </>
                    )}
                    <input
                        name='email'
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder='Your email'
                        required
                    />
                    <input
                        name='password'
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder='Password'
                        required
                    />
                </div>

                <button type="submit">
                    {currState === "Login" ? "Login" : "Create account"}
                </button>

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>

                {currState === "Login" ? (
                    <p>
                        Create a new account?{" "}
                        <span onClick={() => setCurrState('Sign Up')}>Click here</span>
                    </p>
                ) : (
                    <p>
                        Already have an account?{" "}
                        <span onClick={() => setCurrState('Login')}>Login here</span>
                    </p>
                )}
            </form>
        </div>
    )
}

export default LoginPopup
