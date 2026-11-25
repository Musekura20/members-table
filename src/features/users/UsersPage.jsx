import UsersTableSkeleton from "./UsersTableSkeleton";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers, userKeys } from "./queries";
import { fetchUsers } from "../../api/users";
import { useDebounce } from "../../hooks/useDebounce";
import { useTableParams } from "../../hooks/useTableParams";
import UsersTable from "./UsersTable.jsx";

export default function UsersPage() {
  const { params, update } = useTableParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(params.q);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isPending, isFetching, isError, refetch } = useUsers(params);

  useEffect(() => {
    setSearch(params.q);
  }, [params.q]);

  useEffect(() => {
    if (debouncedSearch !== params.q) {
      update({ q: debouncedSearch, gender: "" });
    }
  }, [debouncedSearch, params.q, update]);

  function handleSort(column) {
    const nextOrder =
      params.sortBy === column && params.order === "asc" ? "desc" : "asc";

    update({
      sortBy: column,
      order: nextOrder,
    });
  }

  function handleGenderChange(event) {
    update({
      gender: event.target.value,
      q: "",
    });
    setSearch("");
  }

  async function prefetchNextPage() {
    if (!data || params.page * params.pageSize >= data.total) return;

    const nextParams = {
      ...params,
      page: params.page + 1,
    };

    await queryClient.prefetchQuery({
      queryKey: userKeys.list(nextParams),
      queryFn: () => fetchUsers(nextParams),
    });
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              className="w-full rounded-lg border border-[#E8D7C6] px-4 py-3 outline-none focus:border-[#B66D45] sm:flex-1"
              aria-label="Search members"
            />

            <select
              value={params.gender}
              onChange={handleGenderChange}
              className="rounded-lg border border-[#E8D7C6] px-4 py-3"
              aria-label="Filter by gender"
            >
              <option value="">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              value={params.pageSize}
              onChange={(event) =>
                update({ pageSize: Number(event.target.value) })
              }
              className="rounded-lg border border-[#E8D7C6] px-4 py-3"
              aria-label="Members per page"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {isPending && (
            <div>
              <p className="mb-4 text-sm text-gray-500">Loading members...</p>
              <UsersTableSkeleton />
            </div>
          )}

          {isError && (
            <div className="py-10 text-center">
              <p className="mb-3 text-red-600">
                We couldn't load the members. Please check your internet
                connection and try again.
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-[#17243A] px-5 py-2 text-white"
              >
                Try again
              </button>
            </div>
          )}

          {!isPending && !isError && data && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total members: <strong>{data.total}</strong>
                </p>

                {isFetching && (
                  <span className="text-sm text-[#B66D45]">Updating...</span>
                )}
              </div>

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
                    onClick={() => {
                      setSearch("");
                      update({
                        q: "",
                        gender: "",
                        page: 1,
                      });
                    }}
                    className="mt-4 rounded-lg bg-[#17243A] px-5 py-2 text-white hover:bg-[#263D5B]"
                  >
                    Clear search and filters
                  </button>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => update({ page: params.page - 1 })}
                  disabled={params.page === 1}
                  className="rounded-lg border border-[#E8D7C6] px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {params.page} of{" "}
                  {Math.ceil(data.total / params.pageSize)}
                </span>

                <button
                  onClick={async () => {
                    await prefetchNextPage();
                    update({ page: params.page + 1 });
                  }}
                  disabled={params.page * params.pageSize >= data.total}
                  className="rounded-lg bg-[#17243A] px-4 py-2 text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
