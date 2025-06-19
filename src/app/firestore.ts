import { getFirestore, collection, addDoc, query, orderBy, getDocs, where, doc, getDoc, setDoc } from "firebase/firestore";
import app from "./firebaseInit";
import { FSRSCard } from "./fsrs";

const db = getFirestore(app);

// データ型定義
export interface Skill {
  id: string;
  name: string;
  category?: string;
  nextReviewDate: Date;
  createdAt: Date;
  userId: string;
}

export interface Log {
  id: string;
  skillId: string;
  content: string;
  feeling: 'smooth' | 'difficult' | 'normal';
  analysisResult?: {
    skillLevel: number;
    confidence: number;
    suggestion: string;
    feeling: 'smooth' | 'difficult' | 'normal';
    nextReviewInterval: number;
    difficulty: number;
    retention: number;
    isPractical?: boolean;
    focusAreas?: string[];
    emotionalState?: string;
    practiceQuality?: number;
    timeSpent?: number;
    environment?: string;
    motivation?: number;
  };
  fsrsData?: {
    nextReview: Date;
    lastReviewed: Date;
    stability: number;
    difficulty: number;
    state: number;
  };
  createdAt: Date;
  userId: string;
}

// Skillの操作
export const addSkill = async (userId: string, skillName: string, category?: string): Promise<string> => {
  try {
    const skillData: Omit<Skill, 'id'> = {
      name: skillName,
      category,
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
      createdAt: new Date(),
      userId,
    };
    
    const docRef = await addDoc(collection(db, 'skills'), skillData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding skill: ", error);
    throw error;
  }
};

export const getUserSkills = async (userId: string): Promise<Skill[]> => {
  try {
    const q = query(
      collection(db, 'skills'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const skills: Skill[] = [];
    
    querySnapshot.forEach((doc) => {
      skills.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        nextReviewDate: doc.data().nextReviewDate.toDate(),
      } as Skill);
    });
    
    return skills;
  } catch (error) {
    console.error("Error getting skills: ", error);
    throw error;
  }
};

// Logの操作
export const addLog = async (logData: Omit<Log, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'logs'), {
      ...logData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding log: ", error);
    throw error;
  }
};

export const getUserLogs = async (userId: string): Promise<Log[]> => {
  try {
    const q = query(
      collection(db, 'logs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const logs: Log[] = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as Log);
    });
    
    return logs;
  } catch (error) {
    console.error("Error getting logs: ", error);
    throw error;
  }
};

// FSRS関連の操作
export const getSkillFSRSCard = async (skillId: string, userId: string): Promise<FSRSCard | null> => {
  try {
    const cardDoc = doc(db, 'fsrs_cards', `${userId}_${skillId}`);
    const cardSnapshot = await getDoc(cardDoc);
    
    if (!cardSnapshot.exists()) {
      return null;
    }
    
    const data = cardSnapshot.data();
    // card.due, card.last_review などTimestamp→Date変換
    const card = { ...data.card };
    if (card.due && typeof card.due.toDate === 'function') {
      card.due = card.due.toDate();
    }
    if (card.last_review && typeof card.last_review.toDate === 'function') {
      card.last_review = card.last_review.toDate();
    }
    return {
      cardId: data.cardId,
      skillId: data.skillId,
      card,
      lastReviewed: data.lastReviewed.toDate(),
      nextReview: data.nextReview.toDate(),
    } as FSRSCard;
  } catch (error) {
    console.error("Error getting FSRS card: ", error);
    return null;
  }
};

export const updateSkillFSRSCard = async (skillId: string, userId: string, fsrsCard: FSRSCard): Promise<void> => {
  try {
    const cardDoc = doc(db, 'fsrs_cards', `${userId}_${skillId}`);
    await setDoc(cardDoc, {
      cardId: fsrsCard.cardId,
      skillId: fsrsCard.skillId,
      card: fsrsCard.card,
      lastReviewed: fsrsCard.lastReviewed,
      nextReview: fsrsCard.nextReview,
      userId: userId,
    });
  } catch (error) {
    console.error("Error updating FSRS card: ", error);
    throw error;
  }
};
