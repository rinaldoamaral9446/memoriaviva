import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmDialog = ({ memory, isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen || !memory) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full rounded-2xl shadow-2xl border border-white/20 p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-gray-900 text-center mb-2">
                    Deletar Memória?
                </h3>

                {/* Memory Info */}
                <p className="text-gray-600 text-center mb-4">
                    Tem certeza que deseja deletar:
                </p>
                <p className="text-brand-purple font-bold text-center text-lg mb-4">
                    "{memory.title}"
                </p>

                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                    <p className="text-red-800 text-sm text-center">
                        ⚠️ Esta ação não pode ser desfeita!
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg hover:shadow-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Deletando...' : 'Sim, Deletar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmDialog;
