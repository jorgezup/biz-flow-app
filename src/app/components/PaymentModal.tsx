// PaymentModal.tsx

import React from 'react';
import Modal from 'react-modal';

interface PaymentModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  title: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onRequestClose,
  children,
  title,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={title}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-blue-800">{title}</h2>
          <button onClick={onRequestClose} className="text-2xl text-blue-600 hover:text-blue-800">
            &times;
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;