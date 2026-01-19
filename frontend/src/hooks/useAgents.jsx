import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const useAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/agents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch agents');
            const data = await response.json();
            setAgents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const saveAgent = async (agentData) => {
        setLoading(true);
        setError(null);
        try {
            const url = agentData.id
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/agents/${agentData.id}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/agents`;

            const method = agentData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(agentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save agent');
            }

            const savedAgent = await response.json();

            // Optimistic update
            if (agentData.id) {
                setAgents(prev => prev.map(a => a.id === savedAgent.id ? savedAgent : a));
            } else {
                setAgents(prev => [savedAgent, ...prev]);
            }
            return savedAgent;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteAgent = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/agents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete agent');

            setAgents(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        agents,
        loading,
        error,
        fetchAgents,
        saveAgent,
        deleteAgent
    };
};

export default useAgents;
