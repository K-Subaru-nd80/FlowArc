import React from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface DeleteSkillButtonProps {
  skillId: string;
  onSkillDeleted?: () => void; // スキル削除後の更新用コールバック
  className?: string;
}

const DeleteSkillButton: React.FC<DeleteSkillButtonProps> = ({ skillId, onSkillDeleted, className }) => {
  const handleDelete = async () => {
    const confirmDelete = window.confirm('このスキルを削除してもよろしいですか？');
    if (!confirmDelete) return;

    const firestore = getFirestore();
    try {
      await deleteDoc(doc(firestore, 'skills', skillId));
      console.log('スキルが削除されました');
      // 削除後に親コンポーネントへ通知
      onSkillDeleted?.();
    } catch (error) {
      console.error('スキルの削除に失敗しました:', error);
      alert('スキルの削除に失敗しました');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className={className ? className : 'text-red-500 hover:text-red-700 font-semibold'}
    >
      削除
    </button>
  );
};

export default DeleteSkillButton;
