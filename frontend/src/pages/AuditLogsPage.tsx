import { useEffect, useState } from 'react'

import {
    getAuditLogs,
} from '../services/auditLogService'

import {
    getUsers,
} from '../services/userService'

import type {
    AuthUser,
} from '../types/auth'

import {
    auditActions,
    auditEntityTypes,
} from '../types/auditLog'

import type {
    AuditAction,
    AuditEntityType,
    AuditLog,
    AuditLogPagination,
    AuditSortOrder,
} from '../types/auditLog'

import './AuditLogsPage.css'

const PAGE_LIMIT = 20

function formatDate(date: string): string {
    return new Intl.DateTimeFormat(
        'en-IE',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    ).format(new Date(date))
}

function AuditLogsPage() {
    const [users, setUsers] =
        useState<AuthUser[]>([])

    const [actionFilter, setActionFilter] =
        useState<AuditAction | ''>('')

    const [
        entityTypeFilter,
        setEntityTypeFilter,
    ] = useState<AuditEntityType | ''>('')

    const [
        actorUserIdFilter,
        setActorUserIdFilter,
    ] = useState('')

    const [sortOrder, setSortOrder] =
        useState<AuditSortOrder>('desc')
    const [auditLogs, setAuditLogs] =
        useState<AuditLog[]>([])

    const [pagination, setPagination] =
        useState<AuditLogPagination | null>(
            null,
        )

    const [page, setPage] = useState(1)

    const [isLoading, setIsLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        void getUsers()
            .then((loadedUsers) => {
                if (isActive) {
                    setUsers(loadedUsers)
                }
            })
            .catch(() => {
                // Audit logs can still work
                // even if the user list fails.
            })

        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        let isActive = true

        void getAuditLogs({
            page,
            limit: PAGE_LIMIT,
            sortOrder,
            action:
                actionFilter || undefined,
            entityType:
                entityTypeFilter || undefined,
            actorUserId:
                actorUserIdFilter || undefined,
        })
            .then((result) => {
                if (!isActive) {
                    return
                }

                setAuditLogs(result.data)
                setPagination(
                    result.pagination,
                )
            })
            .catch((loadError: unknown) => {
                if (!isActive) {
                    return
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : 'Could not load audit logs.',
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
    }, [page,
        actionFilter,
        entityTypeFilter,
        actorUserIdFilter,
        sortOrder,
    ])

    function handleActionChange(
        value: string,
    ) {
        setActionFilter(
            value as AuditAction | '',
        )
        setPage(1)
        setError(null)
    }

    function handleEntityTypeChange(
        value: string,
    ) {
        setEntityTypeFilter(
            value as AuditEntityType | '',
        )
        setPage(1)
        setError(null)
    }

    function handleActorChange(
        value: string,
    ) {
        setActorUserIdFilter(value)
        setPage(1)
        setError(null)
    }

    function handleSortOrderChange(
        value: AuditSortOrder,
    ) {
        setSortOrder(value)
        setPage(1)
        setError(null)
    }

    function handlePreviousPage() {
        setPage((currentPage) =>
            Math.max(1, currentPage - 1),
        )
    }

    function handleNextPage() {
        if (
            pagination &&
            page < pagination.totalPages
        ) {
            setPage(
                (currentPage) =>
                    currentPage + 1,
            )
        }
    }

    return (
        <section className="audit-logs-page">
            <header className="audit-logs-header">
                <p className="page-eyebrow">
                    Administration
                </p>

                <h1>Audit Logs</h1>

                <p>
                    Review important actions
                    recorded across the system.
                </p>
            </header>

            <div className="audit-filters">
                <div className="audit-filter-field">
                    <label htmlFor="audit-action">
                        Action
                    </label>

                    <select
                        id="audit-action"
                        value={actionFilter}
                        onChange={(event) => {
                            handleActionChange(
                                event.target.value,
                            )
                        }}
                    >
                        <option value="">
                            All actions
                        </option>

                        {auditActions.map((action) => (
                            <option
                                key={action}
                                value={action}
                            >
                                {action}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="audit-filter-field">
                    <label htmlFor="audit-entity">
                        Entity type
                    </label>

                    <select
                        id="audit-entity"
                        value={entityTypeFilter}
                        onChange={(event) => {
                            handleEntityTypeChange(
                                event.target.value,
                            )
                        }}
                    >
                        <option value="">
                            All entity types
                        </option>

                        {auditEntityTypes.map(
                            (entityType) => (
                                <option
                                    key={entityType}
                                    value={entityType}
                                >
                                    {entityType}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="audit-filter-field">
                    <label htmlFor="audit-actor">
                        Actor
                    </label>

                    <select
                        id="audit-actor"
                        value={actorUserIdFilter}
                        onChange={(event) => {
                            handleActorChange(
                                event.target.value,
                            )
                        }}
                    >
                        <option value="">
                            All users
                        </option>

                        {users.map((user) => (
                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="audit-filter-field">
                    <label htmlFor="audit-sort-order">
                        Date
                    </label>

                    <select
                        id="audit-sort-order"
                        value={sortOrder}
                        onChange={(event) => {
                            handleSortOrderChange(
                                event.target
                                    .value as AuditSortOrder,
                            )
                        }}
                    >
                        <option value="desc">
                            Newest first
                        </option>

                        <option value="asc">
                            Oldest first
                        </option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <p role="status">
                    Loading audit logs...
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="audit-logs-error"
                >
                    {error}
                </p>
            )}

            {!isLoading &&
                !error &&
                auditLogs.length === 0 && (
                    <p>
                        No audit logs found.
                    </p>
                )}

            {!isLoading &&
                !error &&
                auditLogs.length > 0 && (
                    <>
                        <div className="audit-table-wrapper">
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            Date
                                        </th>

                                        <th scope="col">
                                            Action
                                        </th>

                                        <th scope="col">
                                            Entity
                                        </th>

                                        <th scope="col">
                                            Actor
                                        </th>

                                        <th scope="col">
                                            Metadata
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {auditLogs.map(
                                        (auditLog) => (
                                            <tr
                                                key={
                                                    auditLog.id
                                                }
                                            >
                                                <td>
                                                    {formatDate(
                                                        auditLog.createdAt,
                                                    )}
                                                </td>

                                                <td>
                                                    {
                                                        auditLog.action
                                                    }
                                                </td>

                                                <td>
                                                    <div>
                                                        {
                                                            auditLog.entityType
                                                        }
                                                    </div>

                                                    <small>
                                                        {
                                                            auditLog.entityId
                                                        }
                                                    </small>
                                                </td>

                                                <td>
                                                    {auditLog.actorUserId ??
                                                        'System'}
                                                </td>

                                                <td>
                                                    <pre className="audit-metadata">
                                                        {JSON.stringify(
                                                            auditLog.metadata,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pagination && (
                            <div className="audit-pagination">
                                <button
                                    type="button"
                                    onClick={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        page <= 1
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page{' '}
                                    {
                                        pagination.page
                                    }{' '}
                                    of{' '}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        handleNextPage
                                    }
                                    disabled={
                                        page >=
                                        pagination.totalPages
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
        </section>
    )
}

export default AuditLogsPage