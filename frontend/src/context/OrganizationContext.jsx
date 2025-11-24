import React, { createContext, useContext, useState, useEffect } from 'react';

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

    return (
        <OrganizationContext.Provider value={{ organization, setOrganization, branding }}>
            {children}
        </OrganizationContext.Provider>
    );
};
