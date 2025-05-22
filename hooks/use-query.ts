import { useCallback, useEffect, useRef } from "react"
import { toast } from "@/components/ui/use-toast"
import { useGetDataQuery } from "@/utils/query-api"
import { useAuth } from "@/context/auth-context"

interface QueryErrorInterface {
  status: number
  data: any
}

interface UseQueryOptions {
  callback?: (value: any, meta: any) => void
  refetchOnUrlChange?: boolean
  disableAutoFetch?: boolean
  enabled?: boolean // for conditionally skipping the query
}

const useQuery = (
  url?: string | null,
  options: UseQueryOptions = {}
) => {
  const {
    callback,
    refetchOnUrlChange = true,
    disableAutoFetch = false,
    enabled = true,
  } = options

  if (!url || !enabled) {
    return {}
  }

  const { logout } = useAuth()

  const { data, isLoading, refetch, error, isFetching } = useGetDataQuery(url || "", {
    skip: disableAutoFetch,
  })

  const memoizedCallback = useCallback(
    (data: any, meta: any) => {
      if (typeof callback === "function") {
        callback(data, meta)
      }
    },
    [callback]
  )

  const lastErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (refetchOnUrlChange && !disableAutoFetch) {
      refetch()
    }
  }, [url, refetch, refetchOnUrlChange, disableAutoFetch])

  useEffect(() => {
    if (data && !isFetching) {
      memoizedCallback(data, { isLoading, isFetching })
    }
  }, [data, isFetching, isLoading, memoizedCallback])

  useEffect(() => {
    if (error) {
      const { status, data: errorData } = error as QueryErrorInterface
      const errorMessage = errorData?.message || ""

      if (status === 401) {
        logout(true)
      }

      if (errorMessage && lastErrorRef.current !== errorMessage && status !== 503) {
        toast({
          title: "❗️Error",
          description: errorMessage,
          variant: "destructive",
        })
        lastErrorRef.current = errorMessage
      }

      setTimeout(() => {
        lastErrorRef.current = null
      }, 7000)
    }
  }, [error])

  return {
    data,
    isLoading,
    refetch,
    error,
    isFetching,
  }
}

export default useQuery
