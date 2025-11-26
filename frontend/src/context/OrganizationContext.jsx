import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const OrganizationContext = createContext();

export const useOrganization = () => {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within OrganizationProvider');
    }
    return context;
};

export const OrganizationProvider = ({ children }) => {
    const [organization, setOrganization] = useState(null);
    const [branding, setBranding] = useState({
        name: 'Memória Cultural Viva',
        primaryColor: '#4B0082',
        secondaryColor: '#D4AF37',
        logo: null
    });

    // Update branding when organization changes
    useEffect(() => {
        if (organization) {
            setBranding({
                name: organization.name,
                primaryColor: organization.primaryColor || '#4B0082',
                secondaryColor: organization.secondaryColor || '#D4AF37',
                logo: organization.logo || null,
                config: organization.config || {}
            });
        } else {
            // Reset to default
            setBranding({
                name: 'Memória Cultural Viva',
                primaryColor: '#4B0082',
                secondaryColor: '#D4AF37',
                logo: null,
                config: {}
            });
        }
    }, [organization]);

    const updateOrganization = async (id, data) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/organizations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                // Update local state with the updated organization
                // Ensure config is parsed if it comes back as string
                const updatedOrg = result.organization;
                if (updatedOrg.config && typeof updatedOrg.config === 'string') {
                    try {
                        updatedOrg.config = JSON.parse(updatedOrg.config);
                    } catch (e) {
                        // Keep as is or handle error
                    }
                }
                setOrganization(updatedOrg);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating organization:', error);
            return false;
        }
    };

    return (
        <OrganizationContext.Provider value={{ organization, setOrganization, branding, updateOrganization }}>
            {children}
        </OrganizationContext.Provider>
    );
};
