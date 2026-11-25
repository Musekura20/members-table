import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useUsers, userKeys } from './queries'
import { fetchUsers } from '../../api/users'
import { useDebounce } from '../../hooks/useDebounce'
import { useTableParams } from '../../hooks/useTableParams'

import UsersTable from './UsersTable.jsx'
import UsersTableSkeleton from './UsersTableSkeleton.jsx'

export default function UsersPage() {
  const { params, update } = useTableParams()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState(params.q)
  const debouncedSearch = useDebounce(search, 400)

  const {
    data,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useUsers(params)

  // Keep the search input synchronized with browser navigation.
  useEffect(() => {
    setSearch(params.q)
  }, [params.q])

  // Apply search after the user stops typing.
  useEffect(() => {
    if (debouncedSearch !== params.q) {
      update({
        q: debouncedSearch,
        gender: '',
      })
    }
  }, [debouncedSearch, params.q, update])

  // Handle column sorting.
  function handleSort(column) {
    const nextOrder =
      params.sortBy === column && params.order === 'asc'
        ? 'desc'
        : 'asc'

    update({
      sortBy: column,
      order: nextOrder,
    })
  }

  // Handle gender filtering.
  function handleGenderChange(event) {
    update({
      gender: event.target.value,
      q: '',
    })

    setSearch('')
  }

  // Clear search and filters.
  function handleClearFilters() {
    setSearch('')

    update({
      q: '',
      gender: '',
      page: 1,
    })
  }

  // Prefetch the next page.
  function prefetchNextPage() {
    if (!data || params.page * params.pageSize >= data.total) {
      return
    }

    const nextParams = {
      ...params,
      page: params.page + 1,
    }

    queryClient.prefetchQuery({
      queryKey: userKeys.list(nextParams),
      queryFn: () => fetchUsers(nextParams),
    })
  }

  const totalPages = data
    ? Math.ceil(data.total / params.pageSize)
    : 0

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Dashboard heading */}
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#B66D45]">
            Abanyamuryango Cooperative
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#17243A]">
            Members Directory
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage and explore cooperative member information.
          </p>
        </header>

        <section className="rounded-xl border border-[#E8D7C6] bg-white p-5 shadow-sm">

          {/* Search and filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              aria-label="Search members"
              className="w-full rounded-lg border border-[#E8D7C6] px-4 py-3 outline-none focus:border-[#B66D45] focus:ring-2 focus:ring-[#B66D45]/20 sm:flex-1"
            />

            <select
              value={params.gender}
              onChange={handleGenderChange}
              aria-label="Filter by gender"
              className="rounded-lg border border-[#E8D7C6] px-4 py-3"
            >
              <option value="">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              value={params.pageSize}
              onChange={(event) =>
                update({
                  pageSize: Number(event.target.value),
                })
              }
              aria-label="Members per page"
              className="rounded-lg border border-[#E8D7C6] px-4 py-3"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

          </div>

          {/* Initial loading state */}
          {isPending && (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Loading members...
              </p>

              <UsersTableSkeleton />
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold text-red-600">
                Unable to load members
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Please check your internet connection and try again.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-[#17243A] px-5 py-2 text-white hover:bg-[#263D5B]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loaded data */}
          {!isPending && !isError && data && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  Total members:{' '}
                  <strong>{data.total}</strong>
                </p>

                {isFetching && (
                  <span
                    className="text-sm text-[#B66D45]"
                    role="status"
                    aria-live="polite"
                  >
                    Updating...
                  </span>
                )}
              </div>

              {/* Table or empty state */}
              {data.users.length > 0 ? (
                <UsersTable
                  users={data.users}
                  isUpdating={isFetching}
                  sortBy={params.sortBy}
                  order={params.order}
                  onSort={handleSort}
                />
              ) : (
                <div className="py-12 text-center">
                  <h3 className="text-lg font-semibold text-[#17243A]">
                    No members found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-4 rounded-lg bg-[#17243A] px-5 py-2 text-white hover:bg-[#263D5B]"
                  >
                    Clear search and filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {data.users.length > 0 && (
                <nav
                  className="mt-6 flex flex-wrap items-center justify-between gap-3"
                  aria-label="Members table pagination"
                >
                  <button
                    type="button"
                    onClick={() =>
                      update({ page: params.page - 1 })
                    }
                    disabled={params.page === 1}
                    aria-label="Go to previous page"
                    className="rounded-lg border border-[#E8D7C6] px-4 py-2 hover:bg-[#F7F5F0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span
                    className="text-sm text-gray-600"
                    aria-live="polite"
                  >
                    Page {params.page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      prefetchNextPage()
                      update({ page: params.page + 1 })
                    }}
                    disabled={
                      params.page >= totalPages
                    }
                    aria-label="Go to next page"
                    className="rounded-lg bg-[#17243A] px-4 py-2 text-white hover:bg-[#263D5B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}

            </>
          )}

        </section>
      </div>
    </main>
  )
}
