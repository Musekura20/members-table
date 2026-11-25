const columns = [
  { label: 'Name', key: 'firstName' },
  { label: 'Email', key: 'email' },
  { label: 'Phone', key: 'phone' },
  { label: 'Age', key: 'age' },
  { label: 'Gender', key: 'gender' },
  { label: 'Company', key: null },
]

export default function UsersTable({
  users,
  isUpdating,
  sortBy,
  order,
  onSort,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E8D7C6] bg-white">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead className="bg-[#17243A] text-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                className="px-5 py-4 text-sm font-semibold"
              >
                {column.key ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="flex items-center gap-2 hover:text-[#E8D7C6] focus:outline-none focus:ring-2 focus:ring-[#B66D45]"
                    aria-label={`Sort by ${column.label}`}
                    aria-sort={
                      sortBy === column.key
                        ? order === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {column.label}
                    <span>
                      {sortBy === column.key
                        ? order === 'asc' ? '↑' : '↓'
                        : '↕'}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={isUpdating ? 'opacity-50' : ''}>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[#E8D7C6] hover:bg-[#F7F5F0]"
            >
              <td className="sticky left-0 bg-white px-5 py-4 font-medium text-[#17243A]">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-5 py-4 text-sm">{user.email}</td>
              <td className="px-5 py-4 text-sm">{user.phone}</td>
              <td className="px-5 py-4 text-sm">{user.age}</td>
              <td className="px-5 py-4 text-sm capitalize">{user.gender}</td>
              <td className="px-5 py-4 text-sm">
                {user.company?.name || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
