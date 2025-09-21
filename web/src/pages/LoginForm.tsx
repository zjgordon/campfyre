import React from 'react';
import { Box, Paper, Typography, Divider, Link, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { loginSchema, type LoginFormData } from '../lib/validation';
import { useAuthActions } from '../hooks/useStores';
import {
  FormTextField,
  FormSection,
  FormSubmitButton,
  FormActions,
  FormError,
  FormLoadingOverlay,
} from '../components/forms';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthActions();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: data.email,
        role: 'user' as const,
        preferences: {
          theme: 'auto' as const,
          language: 'en',
          notifications: {
            email: true,
            push: false,
            inApp: true,
          },
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            fontSize: 'medium' as const,
          },
        },
      };

      const mockSession = {
        id: 'session-1',
        userId: '1',
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };

      login(mockUser, mockSession);
      navigate('/');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Invalid email or password. Please try again.',
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Campfyre
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        <FormLoadingOverlay loading={isSubmitting}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <FormSection>
              <FormTextField
                name="email"
                control={control}
                label="Email Address"
                type="email"
                required
                placeholder="Enter your email"
                helperText="We'll never share your email with anyone else"
              />

              <FormTextField
                name="password"
                control={control}
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
              />
            </FormSection>

            {errors.root?.message && <FormError error={errors.root.message} />}

            <FormActions justify="space-between">
              <Link
                href="#"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle forgot password
                }}
              >
                Forgot password?
              </Link>

              <FormSubmitButton
                variant="contained"
                size="large"
                loadingText="Signing in..."
              >
                Sign In
              </FormSubmitButton>
            </FormActions>
          </Box>
        </FormLoadingOverlay>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Handle navigation to register
              }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>

        {/* Demo credentials info */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Demo:</strong> Use any valid email format and password to
            sign in
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default LoginForm;
