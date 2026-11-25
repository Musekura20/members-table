
import { useCallback, useEffect, useState } from 'react'

const DEFAULT_PARAMS = {
  page: 1,
  pageSize: 10,
  sortBy: 'firstName',
  order: 'asc',
  q: '',
  gender: '',
}

function readParams() {
  const searchParams = new URLSearchParams(window.location.search)

  return {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    pageSize: Number(searchParams.get('pageSize')) || 10,
    sortBy: searchParams.get('sortBy') || 'firstName',
    order: searchParams.get('order') || 'asc',
    q: searchParams.get('q') || '',
    gender: searchParams.get('gender') || '',
  }
}

export function useTableParams() {
  const [params, setParams] = useState(readParams)

  useEffect(() => {
    function handlePopState() {
      setParams(readParams())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const update = useCallback((changes) => {
    setParams((current) => {
      const next = {
        ...current,
        ...changes,
      }

      if (!Object.prototype.hasOwnProperty.call(changes, 'page')) {
        next.page = 1
      }

      if (next.q && next.gender) {
        next.gender = ''
      }

      const searchParams = new URLSearchParams()

      Object.entries(next).forEach(([key, value]) => {
        if (value !== '' && value !== DEFAULT_PARAMS[key]) {
          searchParams.set(key, value)
        }
      })

      const query = searchParams.toString()
      const newUrl = query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname

      window.history.pushState(null, '', newUrl)

      return next
    })
  }, [])

  return {
    params,
    update,
  }
}
