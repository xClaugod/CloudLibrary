import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Effettua la chiamata al backend utilizzando la fetch
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if(data.token) {
                    Cookies.set('access_token', data.token, );
                    console.log("Token set");
                    navigate("/books");
                }else {
                    alert("Login failed!");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
            <form onSubmit={handleSubmit}>
                <h1>Login</h1>
                <input type="text" placeholder="Username" value={username} onChange={handleUsernameChange} />
                <input type="password" placeholder="Passowrd" value={password} onChange={handlePasswordChange} />
                <button type="submit" className='btnLogin'>Login</button>
                <p>Don't you have an account?<a href="/register">Sign up</a></p>
            </form>
    );
};

export default Login;