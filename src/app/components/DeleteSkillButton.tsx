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
    const firestore = getFirestore();
    try {
      await deleteDoc(doc(firestore, 'skills', skillId));
      onSkillDeleted?.();
    } catch {
      // エラー時は何もしない
    }
    setShowConfirm(false);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative', verticalAlign: 'top' }}>
      <button
        type="button"
        className={className ? className : ''}
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
          boxShadow: '0 1px 4px rgba(244,67,54,0.08)'
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
      >
        削除
      </button>
      {showConfirm && (
        <div className="delete-confirm-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #f44336',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            padding: '20px 24px',
            minWidth: 220,
            textAlign: 'center',
            maxWidth: '90vw',
          }}>
            <div style={{ color: '#222', fontWeight: 700, marginBottom: 12, fontSize: 18 }}>本当に削除しますか？</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button
                style={{
                  background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16
                }}
                onClick={handleDelete}
              >
                削除する
              </button>
              <button
                style={{
                  background: '#fff', color: '#f44336', border: '1px solid #f44336', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16
                }}
                onClick={() => setShowConfirm(false)}
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
