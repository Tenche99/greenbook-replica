import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState(''); // Change to username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // To show a loading state during the API call
    const navigate = useNavigate(); // Create a navigate function

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');  // Clear any previous errors
        setLoading(true);  // Show a loading state

        // Basic validation
        if (!username || !password) {
            setError('Please fill in both fields.');
            setLoading(false);
            return;
        }

        try {
            // Make the API call
            const response = await axios.post('http://localhost/api/User/AuthenticateUser/', {
                sUsername: username, // Change to username
                sPassword: password
            });
            console.log("login response:", response);
            const token = response.data.sJWTToken; // Adjust based on your API's response structure
            if(!token){
                throw new Error("Token is undefined. Please check API response.");
            }

             // Store the token in localStorage
            localStorage.setItem("token", token);
            console.log("Token stored in localStorage:", token);
            

            navigate('/Home');
        } catch (error) {
            // Handle errors from the API
            console.error('Login error:', error.response ? error.response.data : error.message);
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);  // Stop the loading state
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Username</label> {/* Change label to Username */}
                    <input
                        type="text" // Username can be text
                        value={username} // Update to username
                        onChange={(e) => setUsername(e.target.value)} // Update to username
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
