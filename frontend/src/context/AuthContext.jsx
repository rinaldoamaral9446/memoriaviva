import { createContext, useState, useEffect, useContext } from 'react';
import { useOrganization } from './OrganizationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { setOrganization } = useOrganization();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:5001/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` },
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
                    }
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkUser();
    }, [setOrganization]);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        // Set organization from login response
        if (userData.organization) {
            setOrganization(userData.organization);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setOrganization(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
