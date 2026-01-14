import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

/**
 * FormWizard - Multi-step form container with progress indicator
 * 
 * Features:
 * - Step navigation with progress bar
 * - Validation before proceeding
 * - Keyboard navigation support
 * - Animated step transitions
 */

const FormWizard = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  isLoading = false,
  canProceed = true,
  showStepIndicator = true,
}) => {
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
    } else if (canProceed) {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, canProceed, onStepChange, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, isFirstStep, onStepChange]);

  const handleStepClick = useCallback((stepIndex) => {
    // Only allow clicking on completed or current step
    if (stepIndex <= currentStep) {
      onStepChange(stepIndex);
    }
  }, [currentStep, onStepChange]);

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      {showStepIndicator && (
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-base-300" />
          
          {/* Progress bar fill */}
          <motion.div 
            className="absolute top-5 left-0 h-0.5 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />

          {/* Step circles */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentStep}
                  className="flex flex-col items-center group"
                >
                  {/* Circle */}
                  <motion.div
                    className={`
                      wizard-step-circle
                      ${isCurrent ? 'active' : ''}
                      ${isCompleted ? 'completed' : ''}
                      ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                    whileHover={index <= currentStep ? { scale: 1.05 } : {}}
                    whileTap={index <= currentStep ? { scale: 0.95 } : {}}
                  >
                    {isCompleted ? (
                      <IconCheck className="w-5 h-5" />
                    ) : Icon ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </motion.div>

                  {/* Label */}
                  <span className={`
                    mt-2 text-xs font-medium text-center max-w-[80px] truncate
                    ${isCurrent ? 'text-primary' : ''}
                    ${isCompleted ? 'text-success' : 'text-base-content/50'}
                  `}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-base-content/10">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirstStep}
          className={`btn btn-ghost gap-2 ${isFirstStep ? 'invisible' : ''}`}
        >
          <IconChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-sm text-base-content/50">
          Step {currentStep + 1} of {totalSteps}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          className={`btn gap-2 ${isLastStep ? 'btn-success' : 'btn-primary'}`}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : isLastStep ? (
            <>
              <IconCheck className="w-4 h-4" />
              Complete
            </>
          ) : (
            <>
              Next
              <IconChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FormWizard;
