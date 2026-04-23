import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { getGamificationData } from '../utils/gamification';
import './XPCounter.css';

function XPCounter() {
  const [xp, setXP] = useState(0);

  useEffect(() => {
    const updateXP = async () => {
      const data = await getGamificationData();
      setXP(data.userXP || 0);
    };

    updateXP();
    window.addEventListener('gamificationUpdate', updateXP);
    window.addEventListener('storage', updateXP);

    return () => {
      window.removeEventListener('gamificationUpdate', updateXP);
      window.removeEventListener('storage', updateXP);
    };
  }, []);

  return (
    <div className="xp-counter">
      <Trophy size={18} className="xp-icon" />
      <span className="xp-value">{xp} XP</span>
    </div>
  );
}

export default XPCounter;
