import React from 'react';

interface ModalComponentProps {
  isDark: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  modalMessage: string;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ 
  isDark, 
  showModal, 
  setShowModal, 
  modalMessage 
}) => {
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${isDark ? 'bg-claude-orange/30' : 'bg-claude-orange/10'} mb-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-claude-orange' : 'text-claude-orange'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`text-lg font-medium ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} mb-2 font-vastago`}>Success!</h3>
          <p className={`${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-500'} font-vastago`}>{modalMessage}</p>
          <div className="mt-4">
            <button
              onClick={() => setShowModal(false)}
              className={`${isDark ? 'bg-claude-orange/80 text-[#1a1a1a]' : 'bg-claude-orange text-white'} w-full px-4 py-2 rounded-lg ${isDark ? 'hover:bg-claude-orange' : 'hover:bg-claude-orange/90'} transition font-vastago`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent; 