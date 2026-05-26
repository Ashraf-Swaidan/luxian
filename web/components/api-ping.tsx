"use client"

import { useQuery } from "@tanstack/react-query"
import { pingApi } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ApiPing() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.health,
    queryFn: pingApi,
  })

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>API connection</CardTitle>
        <CardDescription>
          Fetches <code className="text-xs">GET /api/v1</code> from your Nest server
        </CardDescription>
      </CardHeader>
      <CardContent className="font-mono text-sm">
        {isPending && <Skeleton className="h-5 w-48" />}
        {isError && (
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Request failed"}
          </p>
        )}
        {data !== undefined && !isError && (
          <p>
            <span className="text-muted-foreground">Response: </span>
            {data}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
