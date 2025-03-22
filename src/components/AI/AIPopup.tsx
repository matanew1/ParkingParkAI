import React, { useState } from 'react';
import { X, Car, Clock, Search, LocateFixed, Route } from 'lucide-react';

interface AIOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface AIPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPopup: React.FC<AIPopupProps> = ({ isOpen, onClose }) => {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  const aiOptions: AIOption[] = [
    {
      id: 'find',
      title: 'Find Parking',
      description: 'Let AI find the best parking spot near your destination',
      icon: <Search className="h-5 w-5 text-blue-500" />,
      action: () => handleAIAction('find')
    },
    {
      id: 'predict',
      title: 'Predict Availability',
      description: 'Get AI predictions for parking availability in the next few hours',
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      action: () => handleAIAction('predict')
    },
    {
      id: 'locate',
      title: 'Remember My Spot',
      description: 'AI will help you remember where you parked your car',
      icon: <LocateFixed className="h-5 w-5 text-green-500" />,
      action: () => handleAIAction('locate')
    },
    {
      id: 'route',
      title: 'Optimal Route',
      description: 'AI will suggest the optimal driving route with parking options',
      icon: <Route className="h-5 w-5 text-orange-500" />,
      action: () => handleAIAction('route')
    }
  ];

  const handleAIAction = (optionId: string): void => {
    setActiveOption(optionId);
    setLoadingAction(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setLoadingAction(false);
      // Here you would typically handle the actual AI logic or API calls
      console.log(`AI action completed for: ${optionId}`);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-80 overflow-hidden border border-gray-200 dark:border-gray-700 animate-slideIn"
        style={{
          transformOrigin: 'top right',
          animation: 'slideIn 0.2s ease-out forwards'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Parking AI Assistant</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close popup"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-3">
          {activeOption ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {aiOptions.find(opt => opt.id === activeOption)?.icon}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                  {aiOptions.find(opt => opt.id === activeOption)?.title}
                </h3>
              </div>
              
              {loadingAction ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Processing your request...
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-800 dark:text-gray-300">
                    AI recommendation ready! This is where the AI results would appear.
                  </p>
                  {/* Sample result UI would go here based on the selected option */}
                </div>
              )}
              
              <button
                onClick={() => setActiveOption(null)}
                className="w-full py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs"
              >
                Back to options
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Select an AI-powered feature to help with your parking needs:
              </p>
              
              <div className="space-y-2">
                {aiOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className="w-full flex items-start p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="mr-2 mt-0.5">{option.icon}</div>
                    <div className="text-left">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{option.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            AI suggestions based on real-time data
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIPopup;