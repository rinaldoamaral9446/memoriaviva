import { createContext, useState, useEffect, useContext } from 'react';
import { useOrganization } from './OrganizationContext';
import { API_URL } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const { setOrganization } = useOrganization();

    useEffect(() => {
        const checkUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    const response = await fetch(`${API_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        // Set organization if available
                        if (userData.organization) {
                            setOrganization(userData.organization);
                        }
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } else {
                setToken(null);
            }
            setLoading(false);
        };

        checkUser();
    }, [setOrganization]);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        // Set organization from login response
        if (userData.organization) {
            setOrganization(userData.organization);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setOrganization(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
