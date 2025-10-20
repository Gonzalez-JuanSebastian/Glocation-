import React from 'react';
import { useApp } from '../../context/AppContext';
import './ConfirmDialog.css';

const ConfirmDialog = () => {
  const { confirmDialog, closeConfirmDialog } = useApp();

  if (!confirmDialog.isOpen) return null;

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };

  const handleCancel = () => {
    if (confirmDialog.onCancel) {
      confirmDialog.onCancel();
    }
    closeConfirmDialog();
  };

  const getDialogIcon = () => {
    const icons = {
      warning: '⚠️',
      danger: '🚨',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[confirmDialog.type] || '⚠️';
  };

  const getDialogColor = () => {
    const colors = {
      warning: '#dd6b20',
      danger: '#e53e3e',
      info: '#3182ce',
      success: '#48bb78'
    };
    return colors[confirmDialog.type] || '#dd6b20';
  };

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div 
          className="confirm-dialog-header"
          style={{ borderBottomColor: getDialogColor() }}
        >
          <div className="confirm-dialog-icon">
            {getDialogIcon()}
          </div>
          <h3 className="confirm-dialog-title">
            {confirmDialog.title}
          </h3>
        </div>
        
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">
            {confirmDialog.message}
          </p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button
            onClick={handleCancel}
            className="confirm-dialog-cancel"
          >
            {confirmDialog.cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="confirm-dialog-confirm"
            style={{ 
              backgroundColor: getDialogColor(),
              borderColor: getDialogColor()
            }}
            autoFocus
          >
            {confirmDialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
