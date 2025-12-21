import React from 'react';
import { AlertTriangle, XCircle, Clock, Shield } from 'lucide-react';

interface ExamTerminationModalProps {
  isOpen: boolean;
  violations: number;
  threshold: number;
  violationReasons: string[];
  onClose: () => void;
}

export const ExamTerminationModal: React.FC<ExamTerminationModalProps> = ({
  isOpen,
  violations,
  threshold,
  violationReasons,
  onClose
}) => {
  if (!isOpen) return null;

  const getViolationDetails = (reason: string) => {
    switch (reason) {
      case 'no_face':
        return {
          title: 'Face Not Visible',
          description: 'Your face was not detected in the camera for extended periods',
          icon: <Shield className="h-6 w-6 text-red-500" />
        };
      case 'multiple_faces':
        return {
          title: 'Multiple People Detected',
          description: 'More than one person was detected in the camera view',
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />
        };
      case 'window_blur':
        return {
          title: 'Window Focus Lost',
          description: 'You switched away from the exam window or minimized the browser',
          icon: <Clock className="h-6 w-6 text-red-500" />
        };
      default:
        return {
          title: 'Proctoring Violation',
          description: 'A proctoring rule was violated during the exam',
          icon: <XCircle className="h-6 w-6 text-red-500" />
        };
    }
  };

  const uniqueReasons = [...new Set(violationReasons)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Exam Terminated</h2>
                <p className="text-gray-600">Due to proctoring violations</p>
              </div>
            </div>
          </div>

          {/* Violation Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Violation Summary</h3>
            </div>
            <p className="text-red-700">
              Your exam has been terminated due to <strong>{violations} violation{violations !== 1 ? 's' : ''}</strong> 
              {' '}out of the allowed {threshold}. This exceeds the maximum number of violations permitted.
            </p>
          </div>

          {/* Detailed Violations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Violation Details</h3>
            <div className="space-y-3">
              {uniqueReasons.map((reason, index) => {
                const details = getViolationDetails(reason);
                const count = violationReasons.filter(r => r === reason).length;
                return (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mr-3">
                      {details.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{details.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Occurred {count} time{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Important Information</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Your exam responses have been saved up to the point of termination</li>
              <li>• You may be able to retake the exam after a cooling-off period</li>
              <li>• Contact your instructor or administrator if you believe this was an error</li>
              <li>• Ensure proper lighting and camera setup for future attempts</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamTerminationModal;
