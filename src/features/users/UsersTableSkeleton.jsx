
export default function UsersTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E8D7C6] bg-white">
      <table className="w-full min-w-[850px]">
        <thead className="bg-[#17243A] text-white">
          <tr>
            {['Name', 'Email', 'Phone', 'Age', 'Gender', 'Company'].map(
              (heading) => (
                <th key={heading} className="px-5 py-4 text-left text-sm">
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 8 }).map((_, index) => (
            <tr key={index} className="border-b border-[#E8D7C6]">
              {Array.from({ length: 6 }).map((_, cellIndex) => (
                <td key={cellIndex} className="px-5 py-5">
                  <div className="h-4 animate-pulse rounded bg-[#E8D7C6]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
