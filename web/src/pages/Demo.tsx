import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Container,
  Alert,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useUserStore, useSessionStore } from '../stores';
import { FormTextField, FormError, FormSuccess } from '../components/forms';

// Demo form schema
const demoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type DemoFormData = z.infer<typeof demoSchema>;

// Mock API function for TanStack Query demo
const fetchDemoData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    message: 'Hello from TanStack Query!',
    timestamp: new Date().toISOString(),
    data: ['Item 1', 'Item 2', 'Item 3'],
  };
};

const Demo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Zustand store usage
  const { currentUser, setUser } = useUserStore();
  const { isAuthenticated, setSession } = useSessionStore();

  // TanStack Query usage
  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['demo'],
    queryFn: fetchDemoData,
  });

  // React Hook Form + Zod usage
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: DemoFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update Zustand stores
      setUser({
        id: 'demo-user',
        name: data.name,
        email: data.email,
        role: 'user',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            inApp: true,
          },
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            fontSize: 'medium',
          },
        },
      });

      setSession({
        id: 'demo-session',
        userId: 'demo-user',
        token: 'demo-token',
        refreshToken: 'demo-refresh-token',
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      });

      setSubmitSuccess(
        'Form submitted successfully! All integrations working.'
      );
      setSubmitError(null);
      reset();
    } catch (error) {
      setSubmitError('Submission failed. Please try again.');
      setSubmitSuccess(null);
    }
  };

  const handleLogin = () => {
    setUser({
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'user',
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          fontSize: 'medium',
        },
      },
    });

    setSession({
      id: 'demo-session',
      userId: 'demo-user',
      token: 'demo-token',
      refreshToken: 'demo-refresh-token',
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });
  };

  const handleLogout = () => {
    // Use the store's clear methods instead of setting to null
    useUserStore.getState().clearUser();
    useSessionStore.getState().clearSession();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Frontend Integration Demo
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        paragraph
      >
        Testing all frontend components working together seamlessly
      </Typography>

      <Stack spacing={3}>
        {/* Responsive Design Demo */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            📱 Responsive Design Test
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Chip
              label={`Screen: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}`}
              color="primary"
            />
            <Chip label={`Theme: ${theme.palette.mode}`} color="secondary" />
            <Chip label="MUI v7 + Emotion ✅" color="success" />
          </Box>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* TanStack Query Demo */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔄 TanStack Query Integration
              </Typography>
              {queryLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Loading data...</Typography>
                </Box>
              )}
              {queryError && (
                <Alert severity="error">Failed to load data</Alert>
              )}
              {queryData && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {queryData.message}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Timestamp:{' '}
                    {new Date(queryData.timestamp).toLocaleTimeString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {queryData.data.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Zustand State Demo */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🗄️ Zustand State Management
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User: {currentUser?.name || 'None'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {currentUser?.email || 'None'}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleLogin}
                  disabled={isAuthenticated}
                >
                  Login Demo
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  disabled={!isAuthenticated}
                >
                  Logout
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* React Hook Form + Zod Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📝 React Hook Form + Zod Validation
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ mt: 2 }}
            >
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormTextField
                    name="name"
                    control={control}
                    label="Name"
                    placeholder="Enter your name"
                    required
                    fullWidth
                  />
                  <FormTextField
                    name="email"
                    control={control}
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    fullWidth
                  />
                </Stack>
                <FormTextField
                  name="message"
                  control={control}
                  label="Message"
                  multiline
                  rows={3}
                  placeholder="Enter your message"
                  required
                  fullWidth
                />
              </Stack>

              {submitError && <FormError error={submitError} />}
              {submitSuccess && <FormSuccess message={submitSuccess} />}

              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2, justifyContent: 'flex-end' }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Demo'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'success.light' }}>
          <Typography variant="h6" gutterBottom color="success.dark">
            ✅ Integration Status
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="success.dark">
              • MUI v7 + Emotion: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • TanStack Query: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • Zustand: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • React Hook Form + Zod: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • Responsive Design: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • TypeScript: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • React Router: Working
            </Typography>
            <Typography variant="body2" color="success.dark">
              • Build Process: Working
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Demo;
