import {
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
} from 'react-router-dom'

import {
    register as registerAccount,
} from '../services/authService'

import './LoginPage.css'

export default function RegisterPage() {
    const navigate = useNavigate()

    const [organizationName, setOrganizationName] =
        useState('')

    const [name, setName] = useState('')
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
            await registerAccount({
                organizationName,
                name,
                email,
                password,
            })

            navigate('/login', {
                replace: true,
                state: {
                    registrationCompleted: true,
                },
            })
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Could not create the account.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="login-page">
            <section
                className="login-card"
                aria-labelledby="register-title"
            >
                <header className="login-brand">
                    <strong>OpsFlow</strong>
                    <span>
                        Supplier Risk Management
                    </span>
                </header>

                <div className="login-content">
                    <p className="login-eyebrow">
                        Create your workspace
                    </p>

                    <h1 id="register-title">
                        Register your organisation
                    </h1>

                    <p className="login-description">
                        Create an organisation and its
                        first administrator account.
                    </p>

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="login-field">
                            <label htmlFor="organizationName">
                                Organisation name
                            </label>

                            <input
                                id="organizationName"
                                name="organizationName"
                                type="text"
                                autoComplete="organization"
                                required
                                minLength={2}
                                maxLength={150}
                                value={organizationName}
                                onChange={(event) => {
                                    setOrganizationName(
                                        event.target.value,
                                    )
                                }}
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="name">
                                Your name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                minLength={2}
                                maxLength={150}
                                value={name}
                                onChange={(event) => {
                                    setName(
                                        event.target.value,
                                    )
                                }}
                            />
                        </div>

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
                                autoComplete="new-password"
                                required
                                minLength={12}
                                maxLength={128}
                                aria-describedby="password-help"
                                value={password}
                                onChange={(event) => {
                                    setPassword(
                                        event.target.value,
                                    )
                                }}
                            />

                            <span
                                id="password-help"
                                className="field-help"
                            >
                                Use at least 12 characters.
                            </span>
                        </div>

                        {error && (
                            <p
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
                                ? 'Creating account...'
                                : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    )
}