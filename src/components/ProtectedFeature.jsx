import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureLockModal from './FeatureLockModal';
import { isFeatureLocked } from '../utils/gamification';

/**
 * ProtectedFeature - Wrapper component that checks feature locks
 * Redirects to dashboard if feature is locked and user tries to access directly
 */
function ProtectedFeature({ featureName, children }) {
  const navigate = useNavigate();
  const [showLockModal, setShowLockModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      if (isFeatureLocked(featureName)) {
        setShowLockModal(true);
      }
      setIsChecking(false);
    };

    checkAccess();
  }, [featureName]);

  const handleModalClose = () => {
    setShowLockModal(false);
    navigate('/dashboard');
  };

  const handleUnlock = () => {
    setShowLockModal(false);
  };

  if (isChecking) {
    return null; // or a loading spinner
  }

  return (
    <>
      {children}
      {showLockModal && (
        <FeatureLockModal
          featureName={featureName}
          onClose={handleModalClose}
          onUnlock={handleUnlock}
        />
      )}
    </>
  );
}

export default ProtectedFeature;

