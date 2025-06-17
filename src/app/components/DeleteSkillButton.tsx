'use client';

import React, { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface DeleteSkillButtonProps {
  skillId: string;
  onSkillDeleted?: () => void;
  className?: string;
}

const DeleteSkillButton: React.FC<DeleteSkillButtonProps> = ({ skillId, onSkillDeleted, className }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const firestore = getFirestore();
      await deleteDoc(doc(firestore, 'skills', skillId));
      onSkillDeleted?.();
    } catch (error) {
      console.error('削除エラー:', error);
    }
    setShowConfirm(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('削除ボタンクリック - showConfirm:', showConfirm);
    setShowConfirm(true);
    console.log('setShowConfirm(true) 実行後');
  };

  const handleModalClose = () => {
    console.log('モーダルを閉じます');
    setShowConfirm(false);
  };

  const handleConfirmDelete = async () => {
    console.log('削除を実行します');
    await handleDelete();
  };

  console.log('レンダリング中 - showConfirm:', showConfirm);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className={className}
        style={{
          color: '#fff',
          background: '#f44336',
          border: 'none',
          borderRadius: 6,
          padding: '6px 16px',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
          marginTop: 12,
          marginBottom: 0,
          boxShadow: '0 1px 4px rgba(244,67,54,0.08)',
          zIndex: 1
        }}
        onClick={handleButtonClick}
      >
        削除
      </button>

      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleModalClose();
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              minWidth: '300px',
              maxWidth: '90vw',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '2px solid #f44336',
              zIndex: 1000000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              本当に削除しますか？
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={handleConfirmDelete}
              >
                削除する
              </button>
              
              <button
                style={{
                  backgroundColor: 'white',
                  color: '#f44336',
                  border: '2px solid #f44336',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={handleModalClose}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteSkillButton;
