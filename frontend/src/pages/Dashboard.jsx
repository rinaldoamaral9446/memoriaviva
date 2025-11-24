import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-700">
                    Bem-vindo de volta, <span className="font-bold">{user?.name}</span>!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Suas Informações</h3>
                    <p className="text-gray-600">Email: {user?.email}</p>
                    <p className="text-gray-600">Membro desde: {new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Atividades Recentes</h3>
                    <p className="text-gray-500 italic">Nenhuma atividade recente.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
