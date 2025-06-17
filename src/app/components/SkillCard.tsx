import React from 'react';
import { Skill } from '../firestore';
import DeleteSkillButton from './DeleteSkillButton';

interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
  onDelete?: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick, onDelete }) => {
  const formatDate = (date: Date): string => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays < 0) return `${Math.abs(diffDays)}日経過`;
    return `${diffDays}日後`;
  };

  const isOverdue = skill.nextReviewDate < new Date();
  const isToday = formatDate(skill.nextReviewDate) === '今日';
  const isTomorrow = formatDate(skill.nextReviewDate) === '明日';

  const getCardStyle = () => {
    let backgroundColor = '#ffffff';
    let borderColor = '#e9ecef';
    let accentColor = '#6ccbc7';

    if (isOverdue) {
      backgroundColor = 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)';
      borderColor = '#f56565';
      accentColor = '#f56565';
    } else if (isToday) {
      backgroundColor = 'linear-gradient(135deg, #fffbf0 0%, #fff3d3 100%)';
      borderColor = '#ed8936';
      accentColor = '#ed8936';
    } else if (isTomorrow) {
      backgroundColor = 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)';
      borderColor = '#805ad5';
      accentColor = '#805ad5';
    }

    return {
      backgroundColor,
      borderColor,
      accentColor,
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div
      style={{
        padding: 20,
        border: `2px solid ${cardStyle.borderColor}`,
        borderRadius: 16,
        background: cardStyle.backgroundColor,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        marginBottom: 16,
        position: 'relative',
        userSelect: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
        }
      }}
      onClick={(e) => {
        // 削除ボタンまたは削除ダイアログがクリックされた場合は何もしない
        const target = e.target as HTMLElement;
        if (target.closest('.delete-skill-button') || target.closest('.delete-confirm-modal')) return;
        if (onClick) onClick();
      }}
    >
      {/* 装飾的なアクセント */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 4,
        background: cardStyle.accentColor,
        zIndex: 1
      }} />
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
        <h3 style={{
          margin: 0, 
          fontSize: 20, 
          fontWeight: 700,
          color: '#2d3748',
          lineHeight: 1.3
        }}>
          {skill.name}
        </h3>
        {skill.category && (
          <span style={{
            fontSize: 12, 
            color: '#718096', 
            backgroundColor: '#f7fafc', 
            padding: '4px 12px', 
            borderRadius: 20,
            fontWeight: 500,
            border: '1px solid #e2e8f0',
            marginLeft: 12
          }}>
            {skill.category}
          </span>
        )}
      </div>
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontSize: 14, color: '#718096', fontWeight: 500}}>次回復習予定</span>
        <span style={{
          fontSize: 16,
          fontWeight: 700,
          color: isOverdue ? '#f56565' : isToday ? '#ed8936' : '#4a5568',
          background: isOverdue ? 'rgba(245, 101, 101, 0.1)' : isToday ? 'rgba(237, 137, 54, 0.1)' : 'rgba(74, 85, 104, 0.1)',
          borderRadius: 12,
          padding: '6px 14px',
          marginLeft: 12,
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${isOverdue ? 'rgba(245, 101, 101, 0.2)' : isToday ? 'rgba(237, 137, 54, 0.2)' : 'rgba(74, 85, 104, 0.2)'}`
        }}>
          {formatDate(skill.nextReviewDate)}
        </span>
      </div>
      
      <DeleteSkillButton className="delete-skill-button" skillId={skill.id} onSkillDeleted={onDelete} />
    </div>
  );
};

export default SkillCard;
