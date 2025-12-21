import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Eye, Users, Monitor } from 'lucide-react';

interface ViolationNotificationProps {
  violations: number;
  threshold: number;
  lastViolationReason?: string;
  onDismiss?: () => void;
}

export const ViolationNotification: React.FC<ViolationNotificationProps> = ({
  violations,
  threshold,
  lastViolationReason,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (violations > 0 && !dismissed) {
      setIsVisible(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [violations, dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const getViolationIcon = (reason?: string) => {
    switch (reason) {
      case 'no_face':
        return <Eye className="h-5 w-5" />;
      case 'multiple_faces':
        return <Users className="h-5 w-5" />;
      case 'window_blur':
        return <Monitor className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getViolationMessage = (reason?: string) => {
    switch (reason) {
      case 'no_face':
        return 'Please ensure your face is visible in the camera';
      case 'multiple_faces':
        return 'Only one person should be visible during the exam';
      case 'window_blur':
        return 'Please stay focused on the exam window';
      default:
        return 'Proctoring violation detected';
    }
  };

  const getSeverityLevel = () => {
    if (violations >= threshold - 1) return 'critical';
    if (violations >= threshold - 2) return 'warning';
    return 'info';
  };

  const severityClasses = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  if (!isVisible || violations === 0) return null;

  const severity = getSeverityLevel();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg border p-4 shadow-lg ${severityClasses[severity]}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getViolationIcon(lastViolationReason)}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">
              Proctoring Alert
            </h3>
            <div className="mt-1 text-sm">
              <p>{getViolationMessage(lastViolationReason)}</p>
              <p className="mt-1 font-medium">
                Violations: {violations}/{threshold}
                {violations >= threshold - 1 && (
                  <span className="ml-2 text-red-600 font-bold">
                    (Final Warning)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationNotification;
