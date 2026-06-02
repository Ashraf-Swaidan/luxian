"use client"

import { useEffect, useState } from "react"

import { DynamicModal } from "@/components/common/dynamic-modal"
import { StaffFormField, staffInputClass } from "@/components/admin/staff/staff-form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { StaffPermissionOption, StaffRole } from "@/features/staff/api"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import { slugifyRoleName } from "@/lib/staff-role-styles"
import type { Permission } from "@/lib/types/auth"
import { cn } from "@/lib/utils"

const staffAccent = adminPrimaryButtonClass("staff")

type StaffRoleFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: StaffRole | null
  permissions: StaffPermissionOption[]
  busy?: boolean
  onSubmit: (body: {
    name: string
    slug: string
    description?: string
    permissions: Permission[]
  }) => void
}

export function StaffRoleFormModal({
  open,
  onOpenChange,
  role,
  permissions,
  busy,
  onSubmit,
}: StaffRoleFormModalProps) {
  const isEdit = Boolean(role)

  return (
    <DynamicModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit role" : "New role"}
      description={
        isEdit
          ? "Update permissions and details for this staff role."
          : "Define a role and choose what areas of the admin it can access."
      }
      compactTitle
    >
      {open ? (
        <StaffRoleFormInner
          key={role?.id ?? "create"}
          role={role}
          permissions={permissions}
          busy={busy}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </DynamicModal>
  )
}

function StaffRoleFormInner({
  role,
  permissions,
  busy,
  onOpenChange,
  onSubmit,
}: {
  role?: StaffRole | null
  permissions: StaffPermissionOption[]
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: StaffRoleFormModalProps["onSubmit"]
}) {
  const isEdit = Boolean(role)
  const [name, setName] = useState(role?.name ?? "")
  const [slug, setSlug] = useState(role?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(role))
  const [description, setDescription] = useState(role?.description ?? "")
  const [selected, setSelected] = useState<Permission[]>(
    () => role?.permissions.map((item) => item.permission) ?? [],
  )

  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(slugifyRoleName(name))
    }
  }, [name, slugTouched])

  const toggle = (permission: Permission) => {
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    )
  }

  const canSubmit = name.trim() && slug.trim() && selected.length > 0

  return (
    <>
      <div className="space-y-5 px-4 py-5 sm:px-6">
        <StaffFormField label="Role name" required>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Designer"
            className={staffInputClass}
          />
        </StaffFormField>
        <StaffFormField label="Slug" required hint="URL-safe id">
          <Input
            value={slug}
            disabled={role?.isSystem}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
            placeholder="designer"
            className={staffInputClass}
          />
        </StaffFormField>
        <StaffFormField label="Description">
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this role is for"
            className={staffInputClass}
          />
        </StaffFormField>
        <div className="space-y-3 border-t border-border/60 pt-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-500 uppercase">Permissions</p>
          <div className="grid gap-2">
            {permissions.map((permission) => {
              const checked = selected.includes(permission.key)
              return (
                <label
                  key={permission.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors",
                    checked
                      ? "border-neutral-950 bg-neutral-50"
                      : "border-border/60 bg-white hover:bg-neutral-50/80",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(permission.key)}
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-snug">{permission.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          className={cn(staffAccent, "min-w-28")}
          disabled={busy || !canSubmit}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              slug: slug.trim().toLowerCase(),
              description: description.trim() || undefined,
              permissions: selected,
            })
          }
        >
          {busy ? "Saving…" : isEdit ? "Save role" : "Create role"}
        </Button>
      </div>
    </>
  )
}
