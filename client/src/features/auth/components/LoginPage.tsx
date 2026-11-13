/* Hallmark · shape: app screen · genre: modern-minimal · theme: Coral (deal 1/3)
 * screen: login · signature: letterpress sign-in card on desk · states: idle, submitting, error
 * axes: light/grotesk-sans/warm · posture: restrained · contrast: pass · v2.0.0 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../api.js';
import { ApiError } from '../../../lib/api.js';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage(): React.ReactElement {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setServerError('Invalid email or password.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <main
      className="min-h-dvh grid place-items-center px-4 py-16"
      style={{ backgroundColor: 'var(--color-desk)' }}
    >
      {/* Letterpress stock card on the desk */}
      <div
        className="w-full max-w-sm rounded-[var(--radius-card)] px-8 py-10"
        style={{
          backgroundColor: 'var(--color-cotton)',
          boxShadow: 'var(--edge-stock), var(--cast-stock)',
        }}
      >
        {/* Wordmark */}
        <p
          className="text-sm font-medium mb-8 tracking-tight"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}
        >
          Accelerator
        </p>

        <h1
          className="text-2xl font-semibold mb-6 leading-tight"
          style={{
            color: 'var(--color-print)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--display-weight)',
            letterSpacing: 'var(--tracking-display)',
          }}
        >
          Sign in
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="h-12 px-3 rounded-[var(--radius-input)] text-sm outline-none w-full"
              style={{
                backgroundColor: 'var(--color-cotton)',
                border: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-rule-2)'}`,
                color: 'var(--color-print)',
                fontFamily: 'var(--font-display)',
                transition: `border-color var(--dur-micro), box-shadow var(--dur-micro)`,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-focus)';
                e.currentTarget.style.boxShadow = '0 0 0 3px oklch(54% 0.17 30 / 0.15)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.email
                  ? 'var(--color-error)'
                  : 'var(--color-rule-2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.email && (
              <span className="text-xs" style={{ color: 'var(--color-error)' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-display)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="h-12 px-3 rounded-[var(--radius-input)] text-sm outline-none w-full"
              style={{
                backgroundColor: 'var(--color-cotton)',
                border: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-rule-2)'}`,
                color: 'var(--color-print)',
                fontFamily: 'var(--font-display)',
                transition: `border-color var(--dur-micro), box-shadow var(--dur-micro)`,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-focus)';
                e.currentTarget.style.boxShadow = '0 0 0 3px oklch(54% 0.17 30 / 0.15)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.password
                  ? 'var(--color-error)'
                  : 'var(--color-rule-2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.password && (
              <span className="text-xs" style={{ color: 'var(--color-error)' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p
              role="alert"
              className="text-sm px-3 py-2.5 rounded-[var(--radius-input)]"
              style={{
                color: 'var(--color-error)',
                backgroundColor: 'oklch(52% 0.19 27 / 0.07)',
                border: '1px solid oklch(52% 0.19 27 / 0.25)',
              }}
            >
              {serverError}
            </p>
          )}

          {/* Submit — ink board button (letterpress card, primary) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-12 w-full rounded-[var(--radius-stock)] text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-board)',
              color: 'var(--color-board-type)',
              fontFamily: 'var(--font-display)',
              boxShadow: 'var(--cast-stock)',
              transition: `transform var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out)`,
            }}
            onMouseEnter={e => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--cast-stock-lift)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = 'var(--cast-stock)';
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
