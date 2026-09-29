import { useState } from 'react'

import type { UserRole } from '../../types/auth'
import type { CreateUserInput } from '../../types/user'

type UserFormProps = {
    onSubmit: (
        input: CreateUserInput,
    ) => Promise<void>
    onCancel: () => void
}

function UserForm({
    onSubmit,
    onCancel,
}: UserFormProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] =
        useState('')
    const [role, setRole] =
        useState<UserRole>('viewer')

    const [isSubmitting, setIsSubmitting] =
        useState(false)

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const input: CreateUserInput = {
            name: name.trim(),
            email: email.trim(),
            password,
            role,
        }

        setIsSubmitting(true)

        try {
            await onSubmit(input)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            className="user-form"
            onSubmit={handleSubmit}
        >
            <h2>Create user</h2>

            <div className="user-form-field">
                <label htmlFor="user-name">
                    Name
                </label>

                <input
                    id="user-name"
                    type="text"
                    minLength={2}
                    maxLength={150}
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value)
                    }}
                    required
                />
            </div>

            <div className="user-form-field">
                <label htmlFor="user-email">
                    Email
                </label>

                <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value)
                    }}
                    required
                />
            </div>

            <div className="user-form-field">
                <label htmlFor="user-password">
                    Password
                </label>

                <input
                    id="user-password"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value)
                    }}
                    required
                />
            </div>

            <div className="user-form-field">
                <label htmlFor="user-role">
                    Role
                </label>

                <select
                    id="user-role"
                    value={role}
                    onChange={(event) => {
                        setRole(
                            event.target.value as UserRole,
                        )
                    }}
                >
                    <option value="admin">
                        Admin
                    </option>

                    <option value="risk_manager">
                        Risk Manager
                    </option>

                    <option value="reviewer">
                        Reviewer
                    </option>

                    <option value="viewer">
                        Viewer
                    </option>
                </select>
            </div>

            <div className="user-form-actions">
                <button
                    className="user-primary-button"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Creating...'
                        : 'Create user'}
                </button>

                <button
                className="user-secondary-button"
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default UserForm