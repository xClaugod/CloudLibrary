import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
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
        fetch('http://localhost:8800/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === 'User registered!') {
                    return navigate("/");
                }
                else {
                    alert("Username already taken!");
                }
            })
            .catch((error) => {
                console.error(error);
            });
        e.preventDefault();

    };
    

    return (
            <form onSubmit={handleSubmit}>
                <h1>Sign Up</h1>
                <input
                    type="text"
                    placeholder='Username'
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                />
                <input
                    type="password"
                    id="password"
                    placeholder='Password'
                    value={password}
                    onChange={handlePasswordChange}
                />
                <button type="submit" className='btnLogin'>Registrati</button>
                <p>
                Hai già un account? <a href="/">Accedi</a>
                </p>
            </form>
    );
};

export default Register;