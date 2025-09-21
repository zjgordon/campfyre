/* eslint-disable no-unused-vars */
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useState, useRef, useEffect } from 'react';

// Generic form hook with Zod validation
export function useFormValidation<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>
): UseFormReturn<T> {
  // @ts-ignore - TypeScript compatibility issue with zodResolver and useForm
  return useForm<T>({
    // @ts-ignore - TypeScript compatibility issue with zodResolver
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options,
  });
}

// Hook for handling form submission with loading states
export function useFormSubmission<T extends Record<string, any>>(
  onSubmit: (data: T) => Promise<void> | void,
  options?: {
    onSuccess?: (_data: T) => void;
    onError?: (_error: Error) => void;
    successMessage?: string;
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (data: T) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        await onSubmit(data);
        setSubmitSuccess(
          options?.successMessage || 'Form submitted successfully'
        );
        options?.onSuccess?.(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setSubmitError(errorMessage);
        options?.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, options]
  );

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    submitSuccess,
    clearError: () => setSubmitError(null),
    clearSuccess: () => setSubmitSuccess(null),
  };
}

// Hook for form field validation with custom rules
export function useFieldValidation() {
  const validateEmail = useCallback((value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  }, []);

  const validatePassword = useCallback((value: string) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value))
      return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(value))
      return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(value))
      return 'Password must contain at least one number';
    return true;
  }, []);

  const validateConfirmPassword = useCallback(
    (value: string, getValues: (name: string) => string) => {
      const password = getValues('password');
      return value === password || 'Passwords do not match';
    },
    []
  );

  const validateRequired = useCallback((value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return true;
  }, []);

  const validateMinLength = useCallback(
    (value: string, minLength: number, fieldName: string) => {
      if (value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters`;
      }
      return true;
    },
    []
  );

  const validateMaxLength = useCallback(
    (value: string, maxLength: number, fieldName: string) => {
      if (value.length > maxLength) {
        return `${fieldName} must be less than ${maxLength} characters`;
      }
      return true;
    },
    []
  );

  const validateUrl = useCallback((value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Please enter a valid URL';
    }
  }, []);

  const validatePhone = useCallback((value: string) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return (
      phoneRegex.test(value.replace(/[\s\-()]/g, '')) ||
      'Please enter a valid phone number'
    );
  }, []);

  return {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validateUrl,
    validatePhone,
  };
}

// Hook for handling form reset with confirmation
export function useFormReset<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options?: {
    confirmMessage?: string;
    onReset?: () => void;
  }
) {
  const handleReset = useCallback(() => {
    const confirmMessage =
      options?.confirmMessage ||
      'Are you sure you want to reset the form? All changes will be lost.';

    if (window.confirm(confirmMessage)) {
      form.reset();
      options?.onReset?.();
    }
  }, [form, options]);

  return { handleReset };
}

// Hook for form field dependencies (conditional validation)
export function useFormDependencies<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  dependencies: Record<string, string[]>
) {
  const watchedValues = form.watch();

  const getDependentFields = useCallback(
    (fieldName: string): string[] => {
      return dependencies[fieldName] || [];
    },
    [dependencies]
  );

  const shouldValidateField = useCallback(
    (fieldName: string): boolean => {
      const dependentFields = getDependentFields(fieldName);
      return dependentFields.every((depField) => {
        const value = watchedValues[depField];
        return value !== undefined && value !== null && value !== '';
      });
    },
    [getDependentFields, watchedValues]
  );

  const getConditionalValidation = useCallback(
    (fieldName: string, validation: any) => {
      return shouldValidateField(fieldName) ? validation : undefined;
    },
    [shouldValidateField]
  );

  return {
    getDependentFields,
    shouldValidateField,
    getConditionalValidation,
    watchedValues,
  };
}

// Hook for form persistence (save draft)
export function useFormPersistence<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  storageKey: string,
  options?: {
    debounceMs?: number;
    exclude?: (keyof T)[];
  }
) {
  const debounceMs = options?.debounceMs || 1000;
  const saveDraft = useCallback(
    (data: T) => {
      const draftData = { ...data };
      const exclude = options?.exclude || [];
      exclude.forEach((key) => delete draftData[key]);

      try {
        localStorage.setItem(storageKey, JSON.stringify(draftData));
      } catch (error) {
        console.warn('Failed to save form draft:', error);
      }
    },
    [storageKey, options?.exclude]
  );

  const loadDraft = useCallback((): Partial<T> | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load form draft:', error);
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear form draft:', error);
    }
  }, [storageKey]);

  // Auto-save on form changes (debounced)
  const watchedValues = form.watch();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft(watchedValues);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watchedValues, saveDraft, debounceMs]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
  };
}

export default {
  useFormValidation,
  useFormSubmission,
  useFieldValidation,
  useFormReset,
  useFormDependencies,
  useFormPersistence,
};
