import { getFirestore, collection, addDoc, query, orderBy, getDocs, where } from "firebase/firestore";
import app from "./firebaseInit";

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
