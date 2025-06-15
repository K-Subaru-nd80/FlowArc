import React from 'react';
import { Skill } from '../firestore';

interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick }) => {
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
    let backgroundColor = 'var(--color-background)';
    let borderColor = '#e0e0e0';

    if (isOverdue) {
      backgroundColor = '#ffebee';
      borderColor = '#f44336';
    } else if (isToday) {
      backgroundColor = '#fff3e0';
      borderColor = '#ff9800';
    } else if (isTomorrow) {
      backgroundColor = '#f3e5f5';
      borderColor = '#9c27b0';
    }

    return {
      backgroundColor,
      borderColor,
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--spacing-base)',
        border: `2px solid ${cardStyle.borderColor}`,
        borderRadius: 'var(--border-radius)',
        backgroundColor: cardStyle.backgroundColor,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        marginBottom: 'var(--spacing-base)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 'var(--font-size-large)',
          fontWeight: 'bold',
        }}>
          {skill.name}
        </h3>
        {skill.category && (
          <span style={{
            fontSize: 'var(--font-size-small)',
            color: '#666',
            backgroundColor: '#f0f0f0',
            padding: '2px 6px',
            borderRadius: '12px',
          }}>
            {skill.category}
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 'var(--font-size-small)',
          color: '#666',
        }}>
          次回復習予定
        </span>
        <span style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 'bold',
          color: isOverdue ? '#f44336' : isToday ? '#ff9800' : 'var(--color-text)',
        }}>
          {formatDate(skill.nextReviewDate)}
        </span>
      </div>
    </div>
  );
};

export default SkillCard;
