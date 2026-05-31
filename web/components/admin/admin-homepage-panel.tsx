"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { ImageUploadField } from "@/components/admin/image-upload-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getCollections } from "@/features/collections/api"
import { getHomepageSettings, updateHomepageSettings } from "@/features/homepage/api"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Collection } from "@/lib/types/collection"
import type { HomepageSettings } from "@/lib/types/homepage"

const NONE = "none"

export function AdminHomepagePanel() {
  const queryClient = useQueryClient()
  const { data: collections } = useQuery({
    queryKey: queryKeys.collections.all,
    queryFn: getCollections,
  })
  const { data: settings, isPending } = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: getHomepageSettings,
  })

  if (isPending || !settings) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <HomepageSettingsForm
      key={settings.updatedAt}
      collections={collections ?? []}
      settings={settings}
      queryClient={queryClient}
    />
  )
}

function HomepageSettingsForm({
  collections,
  queryClient,
  settings,
}: {
  collections: Collection[]
  queryClient: ReturnType<typeof useQueryClient>
  settings: HomepageSettings
}) {
  const [latestCollectionId, setLatestCollectionId] = useState(
    settings.latestCollectionId ?? "",
  )
  const [trendingCollectionId, setTrendingCollectionId] = useState(
    settings.trendingCollectionId ?? "",
  )
  const [bannerCollectionId, setBannerCollectionId] = useState(
    settings.bannerCollectionId ?? "",
  )
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(
    settings.bannerImageUrl,
  )
  const [bannerButtonText, setBannerButtonText] = useState(
    settings.bannerButtonText || "See Collection",
  )

  const updateMutation = useMutation({
    mutationFn: () =>
      updateHomepageSettings({
        latestCollectionId: latestCollectionId || null,
        trendingCollectionId: trendingCollectionId || null,
        bannerCollectionId: bannerCollectionId || null,
        bannerImageUrl,
        bannerButtonText,
      }),
    onSuccess: (next) => {
      toast.success("Homepage saved")
      queryClient.setQueryData(queryKeys.homepage, next)
      void queryClient.invalidateQueries({ queryKey: queryKeys.homepage })
    },
    onError: (error) => toastApiError(error),
  })

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 ring-1 ring-border/60">
        <div className="mb-7">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Landing page
          </p>
          <h2 className="font-display text-5xl font-bold uppercase leading-none text-neutral-950">
            Homepage slots
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <CollectionSelect
            label="Latest collection"
            value={latestCollectionId}
            onChange={setLatestCollectionId}
            collections={collections}
          />
          <CollectionSelect
            label="Banner collection"
            value={bannerCollectionId}
            onChange={setBannerCollectionId}
            collections={collections}
          />
          <CollectionSelect
            label="Trending collection"
            value={trendingCollectionId}
            onChange={setTrendingCollectionId}
            collections={collections}
          />
        </div>
      </section>

      <section className="grid gap-6 bg-white p-6 ring-1 ring-border/60 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <ImageUploadField
          id="homepage-banner-image"
          label="Banner image"
          folder="banners"
          value={bannerImageUrl}
          onChange={setBannerImageUrl}
        />
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Campaign banner
            </p>
            <h2 className="font-display text-5xl font-bold uppercase leading-none text-neutral-950">
              Summer slot
            </h2>
          </div>
          <div className="space-y-2">
            <Label>Button text</Label>
            <Input
              value={bannerButtonText}
              onChange={(event) => setBannerButtonText(event.target.value)}
              className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The banner keeps the current visual layout. This controls the image, the button label,
            and which collection the button opens.
          </p>
        </div>
      </section>

      <Button
        type="button"
        className="w-full"
        disabled={updateMutation.isPending}
        onClick={() => updateMutation.mutate()}
      >
        {updateMutation.isPending ? "Saving homepage..." : "Save homepage"}
      </Button>
    </div>
  )
}

function CollectionSelect({
  collections,
  label,
  onChange,
  value,
}: {
  collections: { id: string; name: string }[]
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || NONE}
        onValueChange={(next) => onChange(next === NONE ? "" : next)}
      >
        <SelectTrigger className="h-10 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
          <SelectValue placeholder="Use fallback products" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Use fallback products</SelectItem>
          {collections.map((collection) => (
            <SelectItem key={collection.id} value={collection.id}>
              {collection.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
