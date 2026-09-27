import {
    useState,
    type FormEvent,
} from 'react'

import './LoginPage.css'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] =
        useState<string | null>(null)

    const [isSubmitting, setIsSubmitting] =
        useState(false)

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault()

        setError(null)
        setIsSubmitting(true)

        try {
            await login({
                email,
                password,
            })

            navigate('/', {
                replace: true,
            })
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not log in.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

   return (
    <main className="login-page">
        <section
            className="login-card"
            aria-labelledby="login-title"
        >
            <header className="login-brand">
                <strong>OpsFlow</strong>
                <span>
                    Supplier Risk Management
                </span>
            </header>

            <div className="login-content">
                <p className="login-eyebrow">
                    Welcome back
                </p>

                <h1 id="login-title">
                    Sign in to your account
                </h1>

                <p className="login-description">
                    Access your suppliers, assessments
                    and compliance operations.
                </p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            aria-describedby={
                                error
                                    ? 'login-error'
                                    : undefined
                            }
                            onChange={(event) => {
                                setEmail(
                                    event.target.value,
                                )
                            }}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            aria-describedby={
                                error
                                    ? 'login-error'
                                    : undefined
                            }
                            onChange={(event) => {
                                setPassword(
                                    event.target.value,
                                )
                            }}
                        />
                    </div>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>

                    {error && (
                        <p
                            id="login-error"
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        className="login-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Signing in...'
                            : 'Sign in'}
                    </button>
                </form>
            </div>
        </section>
    </main>
)
}