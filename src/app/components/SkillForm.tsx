import React, { useState } from 'react';

interface SkillFormProps {
  onSubmit: (skillName: string, category?: string) => void;
  onCancel?: () => void;
}

const SkillForm: React.FC<SkillFormProps> = ({ onSubmit, onCancel }) => {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillName.trim()) {
      onSubmit(skillName.trim(), category.trim() || undefined);
      setSkillName('');
      setCategory('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-base)',
      padding: 'var(--spacing-base)',
      backgroundColor: 'var(--color-background)',
      borderRadius: 'var(--border-radius)',
      border: '1px solid #e0e0e0',
    }}>
      <div>
        <label htmlFor="skillName" style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: 'var(--font-size-small)',
          fontWeight: 'bold',
        }}>
          スキル名 *
        </label>
        <input
          id="skillName"
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="例: 英語、ギター、Python"
          required
          style={{
            width: '100%',
            padding: 'var(--spacing-base)',
            fontSize: 'var(--font-size-base)',
            border: '1px solid #ccc',
            borderRadius: 'var(--border-radius)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label htmlFor="category" style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: 'var(--font-size-small)',
          fontWeight: 'bold',
        }}>
          カテゴリ（任意）
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="例: 語学、楽器、プログラミング"
          style={{
            width: '100%',
            padding: 'var(--spacing-base)',
            fontSize: 'var(--font-size-base)',
            border: '1px solid #ccc',
            borderRadius: 'var(--border-radius)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--spacing-base)',
        justifyContent: 'flex-end',
      }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: 'var(--spacing-base) calc(var(--spacing-base) * 2)',
              backgroundColor: '#f0f0f0',
              color: 'var(--color-text)',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={!skillName.trim()}
          style={{
            padding: 'var(--spacing-base) calc(var(--spacing-base) * 2)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: skillName.trim() ? 'pointer' : 'not-allowed',
            opacity: skillName.trim() ? 1 : 0.5,
          }}
        >
          追加
        </button>
      </div>
    </form>
  );
};

export default SkillForm;
