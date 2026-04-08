import { X, Lock, Trophy, Zap } from 'lucide-react';
import { getFeatureInfo, unlockFeature, getGamificationData } from '../utils/gamification';
import { showToast } from './Toast';
import './FeatureLockModal.css';

function FeatureLockModal({ featureName, onClose, onUnlock }) {
  const info = getFeatureInfo(featureName);
  const data = getGamificationData();

  const handleUnlock = () => {
    const result = unlockFeature(featureName);
    if (result.success) {
      showToast(`Unlocked 1 more use! 🎉`, 'success');
      onUnlock?.();
      onClose();
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="feature-lock-overlay" onClick={onClose}>
      <div className="feature-lock-modal" onClick={(e) => e.stopPropagation()}>
        <button className="feature-lock-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="feature-lock-icon">
          <Lock size={48} />
        </div>

        <h2 className="feature-lock-title">Feature Limit Reached</h2>
        <p className="feature-lock-subtitle">{info.label}</p>

        <div className="feature-lock-stats">
          <div className="feature-lock-stat">
            <span className="stat-label">Used</span>
            <span className="stat-value">{info.used} / {info.limit}</span>
          </div>
          <div className="feature-lock-stat">
            <span className="stat-label">Your XP</span>
            <span className="stat-value xp-highlight">
              <Trophy size={16} /> {data.userXP}
            </span>
          </div>
        </div>

        <div className="feature-lock-unlock">
          <div className="unlock-offer">
            <Zap size={20} className="unlock-icon" />
            <div className="unlock-text">
              <p className="unlock-title">Unlock 1 More Use</p>
              <p className="unlock-cost">Cost: {info.unlockCost} XP</p>
            </div>
          </div>

          {info.canUnlock ? (
            <button className="unlock-btn" onClick={handleUnlock}>
              Spend {info.unlockCost} XP to Unlock
            </button>
          ) : (
            <div className="unlock-blocked">
              <p className="unlock-need">
                Need {info.unlockCost - data.userXP} more XP
              </p>
              <p className="unlock-hint">
                Complete daily quests to earn XP:
                <br />• Resume Sniper (+50 XP)
                <br />• Score Chaser (+60 XP)
                <br />• Portfolio Architect (+40 XP)
                <br />• Portfolio Pro (+35 XP)
                <br />• Resume Crafter (+30 XP)
                <br />• Template Explorer (+20 XP)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeatureLockModal;
