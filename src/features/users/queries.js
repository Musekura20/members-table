import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '../../api/users'

export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
}

export function useUsers(params) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
  })
}
