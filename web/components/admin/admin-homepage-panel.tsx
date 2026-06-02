"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { HomepageColorField, HomepageColorFields } from "@/components/admin/homepage-color-field"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { StoreImage } from "@/components/common/store-image"
import { HomeHero } from "@/components/layout/home-hero"
import { BrandMosaicSection } from "@/components/layout/brand-mosaic-section"
import { CollectionPairSection } from "@/components/layout/collection-pair-section"
import { SummerSeasonBanner } from "@/components/layout/summer-season-banner"
import { NowTrending } from "@/components/products/now-trending"
import { ProductsGrid } from "@/components/products/products-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { getCollectionsForAdmin } from "@/features/collections/api"
import { getHomepageSettings, updateHomepageSettings } from "@/features/homepage/api"
import {
  buildDraftPreviewBundle,
  buildHomepagePayload,
  createDraftFromSettings,
  isDraftDirty,
  resolveCollection,
  type HomepageDraft,
  type HomepageSectionId,
} from "@/features/homepage/draft"
import { revalidatePublicHomepage } from "@/features/homepage/revalidate"
import { getProductsBulk } from "@/features/products/api"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Collection } from "@/lib/types/collection"
import type { HomepageSettings } from "@/lib/types/homepage"
import type { Product } from "@/lib/types/product"
import { HOMEPAGE_COLOR_DEFAULTS } from "@/lib/homepage-color-defaults"
import { cn } from "@/lib/utils"

const NONE = "none"
const HOMEPAGE_MEDIA_OWNER = { ownerType: "HOMEPAGE" as const, ownerId: "homepage" }

const HERO_IMAGE_FALLBACK = "/hero-assets/hero-model2.png"
const BANNER_IMAGE_FALLBACK = "/hero-assets/banner.png"

const BRAND_FALLBACK_SRC = [
  "/brand-assets/image-1.png",
  "/brand-assets/image-2.png",
  "/brand-assets/image-3.png",
  "/brand-assets/image-4.png",
  "/brand-assets/image-5.png",
  "/brand-assets/image-6.png",
] as const

const BRAND_SLOTS = [
  { key: "brandImage1Url", label: "01 / The Collective", mediaSlot: "brand1" },
  { key: "brandImage2Url", label: "02 / Destination", mediaSlot: "brand2" },
  { key: "brandImage3Url", label: "03 / Signature Shirt", mediaSlot: "brand3" },
  { key: "brandImage4Url", label: "04 / Resort Elegance", mediaSlot: "brand4" },
  { key: "brandImage5Url", label: "05 / Sunset Club", mediaSlot: "brand5" },
  { key: "brandImage6Url", label: "06 / Accessories", mediaSlot: "brand6" },
] as const

const SECTIONS: { id: HomepageSectionId; label: string; subtitle: string }[] = [
  { id: "hero", label: "Hero", subtitle: "Full-screen intro" },
  { id: "latest", label: "Latest collection", subtitle: "Product grid" },
  { id: "banner", label: "Campaign banner", subtitle: "Seasonal CTA" },
  { id: "trending", label: "Now trending", subtitle: "Product rail" },
  { id: "mosaic", label: "Brand mosaic", subtitle: "Visual collage" },
  { id: "pair", label: "Collection pair", subtitle: "Dual feature" },
]

export function AdminHomepagePanel() {
  const queryClient = useQueryClient()
  const { data: collections, isPending: collectionsPending } = useQuery({
    queryKey: queryKeys.collections.admin,
    queryFn: getCollectionsForAdmin,
  })
  const { data: settings, isPending: settingsPending } = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: getHomepageSettings,
  })
  const { data: fallbackProductsPage, isPending: productsPending } = useQuery({
    queryKey: queryKeys.products.list({ page: 1, limit: 48 }),
    queryFn: () => getProductsBulk(48),
  })

  if (settingsPending || collectionsPending || productsPending || !settings) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <HomepageComposer
      key={settings.updatedAt}
      collections={collections ?? []}
      fallbackProducts={fallbackProductsPage?.data ?? []}
      settings={settings}
      queryClient={queryClient}
    />
  )
}

function HomepageComposer({
  collections,
  fallbackProducts,
  queryClient,
  settings,
}: {
  collections: Collection[]
  fallbackProducts: Product[]
  queryClient: ReturnType<typeof useQueryClient>
  settings: HomepageSettings
}) {
  const [draft, setDraft] = useState<HomepageDraft>(() => createDraftFromSettings(settings))
  const [expandedSection, setExpandedSection] = useState<HomepageSectionId | null>("hero")

  const toggleSection = (sectionId: HomepageSectionId) => {
    setExpandedSection((current) => (current === sectionId ? null : sectionId))
  }
  const [previewOpen, setPreviewOpen] = useState(false)

  const dirty = isDraftDirty(draft, settings)
  const preview = useMemo(
    () => buildDraftPreviewBundle(draft, settings, collections, fallbackProducts),
    [draft, settings, collections, fallbackProducts],
  )

  const patchDraft = (partial: Partial<HomepageDraft>) => {
    setDraft((current) => ({ ...current, ...partial }))
  }

  const resetDraft = () => {
    setDraft(createDraftFromSettings(settings))
    toast.message("Draft reset to saved homepage")
  }

  const updateMutation = useMutation({
    mutationFn: () => updateHomepageSettings(buildHomepagePayload(draft)),
    onSuccess: async (next) => {
      queryClient.setQueryData(queryKeys.homepage, next)
      void queryClient.invalidateQueries({ queryKey: queryKeys.homepage })
      setPreviewOpen(false)
      try {
        await revalidatePublicHomepage()
        toast.success("Homepage saved")
      } catch {
        toast.warning("Saved. Public page may take a moment to refresh.")
      }
    },
    onError: (error) => toastApiError(error),
  })

  const save = () => updateMutation.mutate()

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 bg-white p-6 ring-1 ring-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Homepage composer</p>
          <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase sm:text-5xl">
            Draft homepage
          </h2>
          <p className="text-sm text-muted-foreground">
            {dirty ? "Unsaved homepage draft" : "Matches the live homepage"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            Preview draft
          </Button>
          {dirty && (
            <Button type="button" variant="ghost" onClick={resetDraft}>
              Reset changes
            </Button>
          )}
          <Button type="button" disabled={!dirty || updateMutation.isPending} onClick={save}>
            {updateMutation.isPending ? "Saving..." : "Save homepage"}
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Section map</p>
          <h3 className="mt-1 font-display text-3xl font-bold text-neutral-950 uppercase">Homepage order</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Expand a section to edit. The map reflects your current draft.
          </p>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((section, index) => (
            <HomepageSectionCard
              key={section.id}
              index={index + 1}
              section={section}
              draft={draft}
              collections={collections}
              expanded={expandedSection === section.id}
              onToggle={() => toggleSection(section.id)}
              patchDraft={patchDraft}
              setBrandImage={(key, url) => patchDraft({ [key]: url } as Partial<HomepageDraft>)}
            />
          ))}
        </div>
      </section>

      <HomepageDraftPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        preview={preview}
        dirty={dirty}
        saving={updateMutation.isPending}
        onSave={save}
      />
    </div>
  )
}

function HomepageSectionCard({
  collections,
  draft,
  expanded,
  index,
  onToggle,
  patchDraft,
  section,
  setBrandImage,
}: {
  collections: Collection[]
  draft: HomepageDraft
  expanded: boolean
  index: number
  onToggle: () => void
  patchDraft: (partial: Partial<HomepageDraft>) => void
  section: (typeof SECTIONS)[number]
  setBrandImage: (key: (typeof BRAND_SLOTS)[number]["key"], url: string | null) => void
}) {
  return (
    <div
      className={cn(
        "bg-white ring-1 transition-colors",
        expanded ? "ring-2 ring-neutral-950" : "ring-border/60",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "group grid w-full gap-4 p-4 text-left transition-colors sm:grid-cols-[auto_minmax(0,1fr)_12rem]",
          !expanded && "hover:bg-neutral-50",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center text-sm font-semibold transition-colors",
            expanded ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white",
          )}
        >
          {String(index).padStart(2, "0")}
        </span>

        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{section.subtitle}</p>
          <p className="font-display text-2xl font-bold text-neutral-950 uppercase">{section.label}</p>
          {!expanded && (
            <SectionSummary sectionId={section.id} draft={draft} collections={collections} />
          )}
        </div>

        {!expanded && (
          <SectionThumbnail sectionId={section.id} draft={draft} collections={collections} />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/60 p-6">
          <SectionEditor
            sectionId={section.id}
            draft={draft}
            patchDraft={patchDraft}
            collections={collections}
            setBrandImage={setBrandImage}
          />
        </div>
      )}
    </div>
  )
}

function SectionSummary({
  collections,
  draft,
  sectionId,
}: {
  collections: Collection[]
  draft: HomepageDraft
  sectionId: HomepageSectionId
}) {
  const collectionLabel = (id: string | null) =>
    id ? (resolveCollection(collections, id)?.name ?? "Unknown collection") : "Fallback products"

  switch (sectionId) {
    case "hero": {
      const collection = resolveCollection(collections, draft.heroCollectionId)
      const wordmark = draft.heroWordmark.trim() || "LUXIAN"
      const heading = draft.heroHeading.trim() || "Sculptural streetwear"
      return (
        <p className="text-sm text-muted-foreground">
          {wordmark} · {heading}
          {collection ? ` · ${collection.name}` : " · Fallback thumbnails"}
        </p>
      )
    }
    case "latest":
      return <p className="text-sm text-muted-foreground">{collectionLabel(draft.latestCollectionId)}</p>
    case "banner": {
      const collection = resolveCollection(collections, draft.bannerCollectionId)
      return (
        <p className="text-sm text-muted-foreground">
          {collection?.name ?? "All products"} · {draft.bannerButtonText || "See Collection"}
        </p>
      )
    }
    case "trending":
      return <p className="text-sm text-muted-foreground">{collectionLabel(draft.trendingCollectionId)}</p>
    case "mosaic": {
      const filled = BRAND_SLOTS.filter((slot) => draft[slot.key]).length
      return (
        <p className="text-sm text-muted-foreground">
          {filled}/6 custom images · {6 - filled} using brand fallbacks
        </p>
      )
    }
    case "pair": {
      const left = resolveCollection(collections, draft.pairLeftCollectionId)?.name
      const right = resolveCollection(collections, draft.pairRightCollectionId)?.name
      const parts = [left, right].filter(Boolean)
      return (
        <p className="text-sm text-muted-foreground">
          {parts.length ? parts.join(" · ") : "No collections selected"}
        </p>
      )
    }
  }
}

function SectionThumbnail({
  collections,
  draft,
  sectionId,
}: {
  collections: Collection[]
  draft: HomepageDraft
  sectionId: HomepageSectionId
}) {
  const thumbClass = "relative aspect-[4/3] overflow-hidden bg-muted ring-1 ring-border/60"

  if (sectionId === "hero") {
    return (
      <div className={thumbClass}>
        <StoreImage
          src={draft.heroImageUrl ?? HERO_IMAGE_FALLBACK}
          alt=""
          fill
          className="object-cover object-bottom"
          sizes="192px"
        />
      </div>
    )
  }

  if (sectionId === "banner") {
    return (
      <div className={thumbClass}>
        <StoreImage
          src={draft.bannerImageUrl ?? BANNER_IMAGE_FALLBACK}
          alt=""
          fill
          className="object-cover"
          sizes="192px"
        />
      </div>
    )
  }

  if (sectionId === "mosaic") {
    return (
      <div className="grid grid-cols-3 gap-1">
        {BRAND_SLOTS.map((slot, index) => (
          <div key={slot.key} className="relative aspect-square overflow-hidden bg-neutral-900">
            <StoreImage
              src={draft[slot.key] ?? BRAND_FALLBACK_SRC[index]}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ))}
      </div>
    )
  }

  if (sectionId === "pair") {
    const left = resolveCollection(collections, draft.pairLeftCollectionId)
    const right = resolveCollection(collections, draft.pairRightCollectionId)
    return (
      <div className="grid grid-cols-2 gap-1">
        {[left, right].map((collection, index) => (
          <PairThumb key={collection?.id ?? `empty-${index}`} collection={collection} />
        ))}
      </div>
    )
  }

  const collectionId =
    sectionId === "latest"
      ? draft.latestCollectionId
      : draft.trendingCollectionId
  const collection = resolveCollection(collections, collectionId)
  const productImage = collection?.collectionProducts?.[0]?.product.imageUrl

  return (
    <div className={thumbClass}>
      {productImage ? (
        <StoreImage src={productImage} alt="" fill className="object-cover" sizes="192px" />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          {collection?.name ?? "Fallback"}
        </div>
      )}
    </div>
  )
}

function PairThumb({ collection }: { collection: Collection | null }) {
  const imageUrl =
    collection?.imageUrl ??
    collection?.collectionProducts?.find((item) => item.product.imageUrl)?.product.imageUrl

  return (
    <div className="relative aspect-[5/4] overflow-hidden bg-muted ring-1 ring-border/60">
      {imageUrl ? (
        <StoreImage src={imageUrl} alt="" fill className="object-cover" sizes="96px" />
      ) : (
        <div className="flex h-full items-center justify-center p-1 text-center text-[9px] font-medium text-muted-foreground uppercase">
          {collection?.name ?? "—"}
        </div>
      )}
    </div>
  )
}

function SectionEditor({
  collections,
  draft,
  patchDraft,
  sectionId,
  setBrandImage,
}: {
  collections: Collection[]
  draft: HomepageDraft
  patchDraft: (partial: Partial<HomepageDraft>) => void
  sectionId: HomepageSectionId
  setBrandImage: (key: (typeof BRAND_SLOTS)[number]["key"], url: string | null) => void
}) {
  return (
    <div className="space-y-6">
      {sectionId === "hero" && (
        <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <ImageUploadField
            id="homepage-hero-image"
            label="Hero model image"
            folder="banners"
            mode="hero"
            value={draft.heroImageUrl}
            onChange={(url) => patchDraft({ heroImageUrl: url })}
            previewAlt="Hero model"
            owner={{ ...HOMEPAGE_MEDIA_OWNER, slot: "hero" }}
          />
          <div className="space-y-5">
            <CollectionSelect
              label="Hero collection"
              value={draft.heroCollectionId ?? ""}
              onChange={(value) => patchDraft({ heroCollectionId: value || null })}
              collections={collections}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              The first three products in this collection appear in the desktop hero thumbnails. Leave empty to use
              fallback products.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Wordmark" value={draft.heroWordmark} onChange={(v) => patchDraft({ heroWordmark: v })} placeholder="LUXIAN" />
              <TextField label="Mobile eyebrow" value={draft.heroEyebrow} onChange={(v) => patchDraft({ heroEyebrow: v })} placeholder="Luxian" />
              <TextField label="Mobile heading" value={draft.heroHeading} onChange={(v) => patchDraft({ heroHeading: v })} placeholder="Sculptural streetwear" className="sm:col-span-2" />
              <TextField label="Mobile tagline" value={draft.heroTagline} onChange={(v) => patchDraft({ heroTagline: v })} placeholder="Technical essentials..." className="sm:col-span-2" />
            </div>
            <HomepageColorFields>
              <HomepageColorField
                label="Background"
                defaultColor={HOMEPAGE_COLOR_DEFAULTS.heroBackground}
                value={draft.heroBackgroundColor}
                onChange={(heroBackgroundColor) => patchDraft({ heroBackgroundColor })}
              />
              <HomepageColorField
                label="Text"
                defaultColor={HOMEPAGE_COLOR_DEFAULTS.heroText}
                value={draft.heroTextColor}
                onChange={(heroTextColor) => patchDraft({ heroTextColor })}
              />
              <HomepageColorField
                label="CTA background"
                defaultColor={HOMEPAGE_COLOR_DEFAULTS.heroCtaBackground}
                value={draft.heroCtaBackgroundColor}
                onChange={(heroCtaBackgroundColor) => patchDraft({ heroCtaBackgroundColor })}
              />
              <HomepageColorField
                label="CTA text"
                defaultColor={HOMEPAGE_COLOR_DEFAULTS.heroCtaText}
                value={draft.heroCtaTextColor}
                onChange={(heroCtaTextColor) => patchDraft({ heroCtaTextColor })}
              />
            </HomepageColorFields>
          </div>
        </div>
      )}

      {sectionId === "latest" && (
        <CollectionSlotEditor
          label="Latest collection"
          value={draft.latestCollectionId ?? ""}
          onChange={(value) => patchDraft({ latestCollectionId: value || null })}
          collections={collections}
          description="Powers the first product grid below the hero. Empty uses the latest catalog products."
        />
      )}

      {sectionId === "banner" && (
        <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <ImageUploadField
            id="homepage-banner-image"
            label="Banner image"
            folder="banners"
            value={draft.bannerImageUrl}
            onChange={(url) => patchDraft({ bannerImageUrl: url })}
            owner={{ ...HOMEPAGE_MEDIA_OWNER, slot: "banner" }}
          />
          <div className="space-y-5">
            <CollectionSelect
              label="Banner collection"
              value={draft.bannerCollectionId ?? ""}
              onChange={(value) => patchDraft({ bannerCollectionId: value || null })}
              collections={collections}
            />
            <TextField label="Button text" value={draft.bannerButtonText} onChange={(v) => patchDraft({ bannerButtonText: v })} />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Controls the campaign image, CTA label, and which collection the button opens.
            </p>
            <HomepageColorFields title="Banner CTA colors">
              <HomepageColorField
                label="CTA background"
                defaultColor={HOMEPAGE_COLOR_DEFAULTS.bannerCtaBackground}
                value={draft.bannerCtaBackgroundColor}
                onChange={(bannerCtaBackgroundColor) => patchDraft({ bannerCtaBackgroundColor })}
              />
              <HomepageColorField
                label="CTA text"
                defaultColor={HOMEPAGE_COLOR_DEFAULTS.bannerCtaText}
                value={draft.bannerCtaTextColor}
                onChange={(bannerCtaTextColor) => patchDraft({ bannerCtaTextColor })}
              />
            </HomepageColorFields>
          </div>
        </div>
      )}

      {sectionId === "trending" && (
        <CollectionSlotEditor
          label="Trending collection"
          value={draft.trendingCollectionId ?? ""}
          onChange={(value) => patchDraft({ trendingCollectionId: value || null })}
          collections={collections}
          description="Powers the Now trending rail. Empty uses fallback catalog products."
        />
      )}

      {sectionId === "mosaic" && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {BRAND_SLOTS.map((slot) => (
              <ImageUploadField
                key={slot.key}
                id={`homepage-${slot.key}`}
                label={slot.label}
                folder="brand-assets"
                value={draft[slot.key]}
                onChange={(url) => setBrandImage(slot.key, url)}
                previewAlt={slot.label}
                owner={{ ...HOMEPAGE_MEDIA_OWNER, slot: slot.mediaSlot }}
              />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These six images feed the homepage collage in order. Empty slots use prepared Luxian brand assets.
          </p>
          <HomepageColorFields>
            <HomepageColorField
              label="Section background"
              defaultColor={HOMEPAGE_COLOR_DEFAULTS.mosaicBackground}
              value={draft.mosaicBackgroundColor}
              onChange={(mosaicBackgroundColor) => patchDraft({ mosaicBackgroundColor })}
            />
            <HomepageColorField
              label="Text"
              defaultColor={HOMEPAGE_COLOR_DEFAULTS.mosaicText}
              value={draft.mosaicTextColor}
              onChange={(mosaicTextColor) => patchDraft({ mosaicTextColor })}
            />
            <HomepageColorField
              label="CTA background"
              defaultColor={HOMEPAGE_COLOR_DEFAULTS.mosaicCtaBackground}
              value={draft.mosaicCtaBackgroundColor}
              onChange={(mosaicCtaBackgroundColor) => patchDraft({ mosaicCtaBackgroundColor })}
            />
            <HomepageColorField
              label="CTA text"
              defaultColor={HOMEPAGE_COLOR_DEFAULTS.mosaicCtaText}
              value={draft.mosaicCtaTextColor}
              onChange={(mosaicCtaTextColor) => patchDraft({ mosaicCtaTextColor })}
            />
          </HomepageColorFields>
        </div>
      )}

      {sectionId === "pair" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CollectionSelect
              label="Left collection"
              value={draft.pairLeftCollectionId ?? ""}
              onChange={(value) => patchDraft({ pairLeftCollectionId: value || null })}
              collections={collections}
            />
            <CollectionSelect
              label="Right collection"
              value={draft.pairRightCollectionId ?? ""}
              onChange={(value) => patchDraft({ pairRightCollectionId: value || null })}
              collections={collections}
            />
          </div>
          <HomepageColorFields title="Background wash">
            <HomepageColorField
              label="Gradient start"
              defaultColor={HOMEPAGE_COLOR_DEFAULTS.pairGradientStart}
              value={draft.pairGradientStartColor}
              onChange={(pairGradientStartColor) => patchDraft({ pairGradientStartColor })}
            />
            <HomepageColorField
              label="Gradient end"
              defaultColor={HOMEPAGE_COLOR_DEFAULTS.pairGradientEnd}
              value={draft.pairGradientEndColor}
              onChange={(pairGradientEndColor) => patchDraft({ pairGradientEndColor })}
            />
          </HomepageColorFields>
        </div>
      )}
    </div>
  )
}

function CollectionSlotEditor({
  collections,
  description,
  label,
  onChange,
  value,
}: {
  collections: Collection[]
  description: string
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div className="max-w-md space-y-4">
      <CollectionSelect label={label} value={value} onChange={onChange} collections={collections} />
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function HomepageDraftPreview({
  dirty,
  onOpenChange,
  onSave,
  open,
  preview,
  saving,
}: {
  dirty: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  open: boolean
  preview: ReturnType<typeof buildDraftPreviewBundle>
  saving: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[100dvh] max-h-[100dvh] gap-0 overflow-hidden p-0">
        <div className="flex shrink-0 flex-col gap-3 border-b border-border/60 bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SheetTitle className="text-3xl sm:text-4xl">Draft preview</SheetTitle>
            <SheetDescription>
              This is how the homepage will look if you save these changes.
              {dirty ? " You have unsaved edits." : " Draft matches the saved homepage."}
            </SheetDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Back to editing
            </Button>
            <Button type="button" disabled={!dirty || saving} onClick={onSave}>
              {saving ? "Saving..." : "Save homepage"}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white [&_a]:pointer-events-none">
          <main>
            <HomeHero products={preview.heroProducts} settings={preview.homepage} />
            <ProductsGrid
              latestCollection={preview.latestCollection}
              products={preview.latestProducts}
            />
            <SummerSeasonBanner homepage={preview.homepage} />
            <NowTrending products={preview.trendingProducts} />
            <BrandMosaicSection homepage={preview.homepage} />
            <CollectionPairSection collections={preview.pairCollections} homepage={preview.homepage} />
          </main>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function TextField({
  className,
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
      />
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
      <Select value={value || NONE} onValueChange={(next) => onChange(next === NONE ? "" : next)}>
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
