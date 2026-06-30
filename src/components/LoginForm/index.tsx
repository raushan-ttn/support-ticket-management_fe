'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useLoginMutation } from '@/services/auth-api';
import { setCredentials } from '@/lib/store/authSlice';
import type { AppDispatch } from '@/lib/store';
import { loginSchema, type LoginPayload } from '@/types/auth';
import { TtnLogoIcon } from '@/components/common/globalSvg';
import styles from './login-form.module.scss';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading: isSubmitting }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginPayload) {
    try {
      const data = await login(values).unwrap();
      dispatch(setCredentials(data.user));
      router.push('/tickets');
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status: unknown }).status)
          : undefined;
      const message =
        typeof error === 'object' && error !== null && 'data' in error
          ? String((error as { data: unknown }).data)
          : 'Invalid credentials';

      setError('root', {
        message:
          status === 429
            ? 'Too many login attempts. Please try again later.'
            : message,
      });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <div className={styles.logoText}>
          <span>TO THE</span>
          <span>NEW</span>
        </div>
        <TtnLogoIcon className={styles.logoIcon} />
      </div>

      <div className={styles.card}>
        <h1 className={styles.heading}>TO THE NEW Growth App Login</h1>
        <p className={styles.subtitle}>
          Use your TO THE NEW email address and password to sign in.
        </p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  autoComplete="email"
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  size="small"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  fullWidth
                />
              )}
            />

            {errors.root && (
              <Alert severity="error" role="alert">
                {errors.root.message}
              </Alert>
            )}

            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </form>
      </div>

      <div className={styles.divider} />
    </div>
  );
}
