import { NextRequest, NextResponse } from 'next/server';
import { getUserSkills, addSkill, getSkillFSRSCard } from '../../firestore';
import { formatNextReviewDate, getReviewUrgency, getDaysUntilNextReview } from '../../fsrs';

// GET: ユーザーのスキル一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const skills = await getUserSkills(userId);
    
    // 各スキルにFSRS情報を追加
    const skillsWithFSRS = await Promise.all(
      skills.map(async (skill) => {
        const fsrsCard = await getSkillFSRSCard(skill.id, userId);
        if (fsrsCard) {
          return {
            ...skill,
            fsrsInfo: {
              nextReviewFormatted: formatNextReviewDate(fsrsCard),
              urgency: getReviewUrgency(fsrsCard),
              daysUntilNext: getDaysUntilNextReview(fsrsCard),
              stability: fsrsCard.card.stability,
              difficulty: fsrsCard.card.difficulty,
            }
          };
        }
        return skill;
      })
    );

    return NextResponse.json({ skills: skillsWithFSRS });
  } catch (error) {
    console.error('スキル取得エラー:', error);
    return NextResponse.json(
      { error: 'スキルの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいスキルを追加
export async function POST(request: NextRequest) {
  try {
    const { userId, skillName, category } = await request.json();

    if (!userId || !skillName) {
      return NextResponse.json(
        { error: 'ユーザーIDとスキル名は必須です' },
        { status: 400 }
      );
    }

    const skillId = await addSkill(userId, skillName, category);
    
    return NextResponse.json({ 
      skillId, 
      success: true,
      message: 'スキルが追加されました'
    });
  } catch (error) {
    console.error('スキル追加エラー:', error);
    return NextResponse.json(
      { error: 'スキルの追加中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
