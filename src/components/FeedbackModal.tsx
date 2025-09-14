'use client';

import React, { useState } from 'react';
import { UserFeedback } from '@/types';
import { FeedbackService } from '@/lib/feedbackService';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (feedbackId: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'improvement' as UserFeedback['type'],
    category: 'usability' as UserFeedback['category'],
    priority: 'medium' as UserFeedback['priority'],
    title: '',
    description: '',
    reproductionSteps: [''],
    expectedBehavior: '',
    actualBehavior: '',
  });

  const feedbackTypes = [
    { value: 'bug', label: 'Bug/Fout', description: 'Iets werkt niet zoals verwacht' },
    { value: 'feature_request', label: 'Functie verzoek', description: 'Nieuwe functionaliteit voorstellen' },
    { value: 'improvement', label: 'Verbetering', description: 'Bestaande functionaliteit verbeteren' },
    { value: 'question', label: 'Vraag', description: 'Hulp nodig of onduidelijkheid' },
    { value: 'other', label: 'Anders', description: 'Overige feedback' },
  ];

  const categories = [
    { value: 'usability', label: 'Gebruiksvriendelijkheid' },
    { value: 'performance', label: 'Prestaties' },
    { value: 'functionality', label: 'Functionaliteit' },
    { value: 'design', label: 'Ontwerp' },
    { value: 'data', label: 'Gegevens' },
    { value: 'other', label: 'Anders' },
  ];

  const priorities = [
    { value: 'low', label: 'Laag', color: 'text-green-600' },
    { value: 'medium', label: 'Gemiddeld', color: 'text-yellow-600' },
    { value: 'high', label: 'Hoog', color: 'text-red-600' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleReproductionStepChange = (index: number, value: string) => {
    const newSteps = [...formData.reproductionSteps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, reproductionSteps: newSteps }));
  };

  const addReproductionStep = () => {
    setFormData(prev => ({
      ...prev,
      reproductionSteps: [...prev.reproductionSteps, '']
    }));
  };

  const removeReproductionStep = (index: number) => {
    if (formData.reproductionSteps.length > 1) {
      const newSteps = formData.reproductionSteps.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, reproductionSteps: newSteps }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Titel is verplicht');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Beschrijving is verplicht');
      return false;
    }
    if (formData.title.length < 5) {
      setError('Titel moet minimaal 5 karakters bevatten');
      return false;
    }
    if (formData.description.length < 10) {
      setError('Beschrijving moet minimaal 10 karakters bevatten');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackService = FeedbackService.getInstance();
      
      const feedbackData: Omit<UserFeedback, 'id' | 'timestamp' | 'status' | 'browserInfo' | 'pageContext'> = {
        userId: user?.id,
        userRole: user?.rol,
        type: formData.type,
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        reproductionSteps: formData.reproductionSteps.filter(step => step.trim()),
        expectedBehavior: formData.expectedBehavior.trim() || undefined,
        actualBehavior: formData.actualBehavior.trim() || undefined,
      };

      const result = await feedbackService.submitFeedback(feedbackData);

      if (result.success && result.feedbackId) {
        onSuccess?.(result.feedbackId);
        handleClose();
      } else {
        setError(result.error || 'Er is een onbekende fout opgetreden');
      }
    } catch {
      setError('Er is een fout opgetreden bij het versturen van de feedback. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: 'improvement',
        category: 'usability',
        priority: 'medium',
        title: '',
        description: '',
        reproductionSteps: [''],
        expectedBehavior: '',
        actualBehavior: '',
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedType = feedbackTypes.find(t => t.value === formData.type);
  const isBugReport = formData.type === 'bug';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Feedback versturen
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type feedback *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {feedbackTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${
                    formData.type === type.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                  {formData.type === type.value && (
                    <div className="text-indigo-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioriteit *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Korte beschrijving van je feedback"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={100}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/100 karakters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschrijving *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={`Beschrijf ${selectedType?.label.toLowerCase()} in detail...`}
              rows={4}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={1000}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/1000 karakters
            </p>
          </div>

          {/* Bug-specific fields */}
          {isBugReport && (
            <>
              {/* Reproduction Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stappen om te reproduceren
                </label>
                {formData.reproductionSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500 min-w-[20px]">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleReproductionStepChange(index, e.target.value)}
                      placeholder={`Stap ${index + 1}`}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formData.reproductionSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReproductionStep(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReproductionStep}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  + Stap toevoegen
                </button>
              </div>

              {/* Expected vs Actual Behavior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verwacht gedrag
                  </label>
                  <textarea
                    value={formData.expectedBehavior}
                    onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                    placeholder="Wat had er moeten gebeuren?"
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daadwerkelijk gedrag
                  </label>
                  <textarea
                    value={formData.actualBehavior}
                    onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                    placeholder="Wat gebeurde er in plaats daarvan?"
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Versturen...
                </div>
              ) : (
                'Feedback versturen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;