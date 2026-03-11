
import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick, label = 'Nuevo' }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-3.5 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 hover:shadow-xl active:scale-95 transition-all duration-150 font-medium text-sm"
        >
            <Plus size={18} />
            {label}
        </button>
    );
}
