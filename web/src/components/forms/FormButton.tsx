import React from 'react';
import {
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useFormState } from 'react-hook-form';

interface FormButtonProps {
  type?: 'submit' | 'button' | 'reset';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick?: () => void;
  sx?: any;
}

export const FormButton: React.FC<FormButtonProps> = ({
  type = 'submit',
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  children,
  onClick,
  sx,
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      sx={sx}
    >
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <CircularProgress size={16} color="inherit" />
        </Box>
      )}
      {loading ? loadingText : children}
    </Button>
  );
};

// Form submit button with automatic loading state
interface FormSubmitButtonProps extends Omit<FormButtonProps, 'loading'> {
  loadingText?: string;
  showError?: boolean;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  loadingText = 'Submitting...',
  showError = true,
  children,
  ...props
}) => {
  const { isSubmitting, isValid } = useFormState();

  return (
    <Box>
      <FormButton
        {...props}
        type="submit"
        loading={isSubmitting}
        loadingText={loadingText}
        disabled={!isValid}
      >
        {children}
      </FormButton>
      {showError && !isValid && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, display: 'block' }}
        >
          Please fix the form errors before submitting
        </Typography>
      )}
    </Box>
  );
};

// Form action buttons container
interface FormActionsProps {
  children: React.ReactNode;
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around';
  spacing?: number;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  justify = 'flex-end',
  spacing = 2,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: justify,
        gap: spacing,
        mt: 3,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </Box>
  );
};

// Form error display component
interface FormErrorProps {
  error?: string | Error;
  title?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

export const FormError: React.FC<FormErrorProps> = ({
  error,
  title = 'Error',
  severity = 'error',
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {errorMessage}
    </Alert>
  );
};

// Form success message component
interface FormSuccessProps {
  message: string;
  title?: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  title = 'Success',
}) => {
  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

// Loading overlay component for forms
interface FormLoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const FormLoadingOverlay: React.FC<FormLoadingOverlayProps> = ({
  loading,
  message = 'Loading...',
  children,
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
          {message && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default {
  FormButton,
  FormSubmitButton,
  FormActions,
  FormError,
  FormSuccess,
  FormLoadingOverlay,
};
