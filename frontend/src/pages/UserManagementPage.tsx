import { useEffect, useState } from 'react'

import {
    createUser,
    getUsers,
    updateUserRole,
} from '../services/userService'

import UserForm from '../components/users/UserForm'

import type { CreateUserInput } from '../types/user'

import type {
    AuthUser,
    UserRole,
} from '../types/auth'

import './UserManagementPage.css'


function formatDate(date: string): string {
    return new Intl.DateTimeFormat(
        'en-IE',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    ).format(new Date(date))
}

function UserManagementPage() {
    const [isCreatingUser, setIsCreatingUser] =
        useState(false)

    const [feedback, setFeedback] =
        useState<string | null>(null)

    const [users, setUsers] =
        useState<AuthUser[]>([])

    const [isLoading, setIsLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    const [
        updatingUserId,
        setUpdatingUserId,
    ] = useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        void getUsers()
            .then((loadedUsers) => {
                if (isActive) {
                    setUsers(loadedUsers)
                }
            })
            .catch((loadError: unknown) => {
                if (!isActive) {
                    return
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : 'Could not load users.',
                )
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false)
                }
            })

        return () => {
            isActive = false
        }
    }, [])

    async function handleRoleChange(
        userId: string,
        role: UserRole,
    ) {
        setUpdatingUserId(userId)
        setFeedback(null)

        try {
            const updatedUser =
                await updateUserRole(
                    userId,
                    {
                        role,
                    },
                )

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId
                        ? updatedUser
                        : user,
                ),
            )

            setFeedback(
                'User role updated successfully.',
            )
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : 'Could not update user role.',
            )
        } finally {
            setUpdatingUserId(null)
        }
    }

    async function handleCreateUser(
        input: CreateUserInput,
    ) {
        setFeedback(null)

        try {
            const newUser =
                await createUser(input)

            setUsers((currentUsers) => [
                ...currentUsers,
                newUser,
            ])

            setIsCreatingUser(false)

            setFeedback(
                'User created successfully.',
            )
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : 'Could not create user.',
            )
        }
    }

    return (
        <section className="user-management-page">
            <header className="user-management-header">
                <p className="page-eyebrow">
                    Administration
                </p>

                <h1>User Management</h1>

                <p>
                    Manage users and access roles
                    for your organisation.
                </p>
            </header>
            {!isCreatingUser && (
                <button
                    className="user-primary-button"
                    type="button"
                    onClick={() => {
                        setFeedback(null)
                        setIsCreatingUser(true)
                    }}
                >
                    Create user
                </button>
            )}

            {isCreatingUser && (
                <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => {
                        setIsCreatingUser(false)
                    }}
                />
            )}

            {feedback && (
                <p role="status"
                    className="user-feedback"
                >
                    {feedback}
                </p>
            )}

            {isLoading && (
                <p role="status">
                    Loading users...
                </p>
            )}

            {error && (
                <p role="alert"
                    className="user-error"
                >
                    {error}
                </p>
            )}

            {!isLoading &&
                !error &&
                users.length === 0 && (
                    <p>
                        No users found.
                    </p>
                )}

            {!isLoading &&
                !error &&
                users.length > 0 && (
                    <div className="user-table-wrapper">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        Name
                                    </th>

                                    <th scope="col">
                                        Email
                                    </th>

                                    <th scope="col">
                                        Role
                                    </th>

                                    <th scope="col">
                                        Status
                                    </th>

                                    <th scope="col">
                                        Created
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            {user.name}
                                        </td>

                                        <td>
                                            {user.email}
                                        </td>

                                        <td>
                                            <select
                                                value={user.role}
                                                disabled={
                                                    updatingUserId === user.id
                                                }
                                                onChange={(event) => {
                                                    void handleRoleChange(
                                                        user.id,
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
                                        </td>

                                        <td>
                                            {user.isActive
                                                ? 'Active'
                                                : 'Inactive'}
                                        </td>

                                        <td>
                                            {formatDate(
                                                user.createdAt,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
        </section>
    )
}

export default UserManagementPage