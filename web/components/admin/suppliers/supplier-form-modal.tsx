"use client"

import { useState } from "react"

import { DynamicModal } from "@/components/common/dynamic-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SupplierInput } from "@/features/suppliers/api"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import type { Supplier } from "@/lib/types/supplier"
import { cn } from "@/lib/utils"

const supplierAccent = adminPrimaryButtonClass("suppliers")

type SupplierFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  busy?: boolean
  onSubmit: (input: SupplierInput) => void
  onDeactivate?: () => void
}

const emptyDraft = (): SupplierInput => ({
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  notes: "",
})

function supplierToDraft(supplier?: Supplier | null): SupplierInput {
  if (!supplier) return emptyDraft()
  return {
    name: supplier.name,
    contactPerson: supplier.contactPerson ?? "",
    email: supplier.email ?? "",
    phone: supplier.phone ?? "",
    notes: supplier.notes ?? "",
  }
}

export function SupplierFormModal({
  open,
  onOpenChange,
  supplier,
  busy,
  onSubmit,
  onDeactivate,
}: SupplierFormModalProps) {
  const isEdit = Boolean(supplier)
  const formKey = supplier?.id ?? "create"

  return (
    <DynamicModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit supplier" : "Add supplier"}
      description={
        isEdit ? "Update supplier contact details." : "Create a new supplier for incoming orders."
      }
    >
      {open ? (
        <SupplierFormModalInner
          key={formKey}
          supplier={supplier}
          busy={busy}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          onDeactivate={onDeactivate}
        />
      ) : null}
    </DynamicModal>
  )
}

function SupplierFormModalInner({
  supplier,
  busy,
  onOpenChange,
  onSubmit,
  onDeactivate,
}: {
  supplier?: Supplier | null
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: SupplierInput) => void
  onDeactivate?: () => void
}) {
  const isEdit = Boolean(supplier)
  const [draft, setDraft] = useState<SupplierInput>(() => supplierToDraft(supplier))

  const dirty =
    !supplier ||
    draft.name !== supplier.name ||
    (draft.contactPerson ?? "") !== (supplier.contactPerson ?? "") ||
    (draft.email ?? "") !== (supplier.email ?? "") ||
    (draft.phone ?? "") !== (supplier.phone ?? "") ||
    (draft.notes ?? "") !== (supplier.notes ?? "")

  const setField = (field: keyof SupplierInput, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = () => {
    if (!draft.name.trim()) return
    onSubmit({
      name: draft.name.trim(),
      contactPerson: draft.contactPerson?.trim() || null,
      email: draft.email?.trim() || null,
      phone: draft.phone?.trim() || null,
      notes: draft.notes?.trim() || null,
    })
  }

  return (
    <>
      <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        <Field label="Supplier name" required>
          <Input
            value={draft.name}
            onChange={(event) => setField("name", event.target.value)}
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </Field>
        <Field label="Contact person">
          <Input
            value={draft.contactPerson ?? ""}
            onChange={(event) => setField("contactPerson", event.target.value)}
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={draft.email ?? ""}
            onChange={(event) => setField("email", event.target.value)}
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={draft.phone ?? ""}
            onChange={(event) => setField("phone", event.target.value)}
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </Field>
        <Field label="Notes">
          <Input
            value={draft.notes ?? ""}
            onChange={(event) => setField("notes", event.target.value)}
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </Field>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          {isEdit && supplier?.isActive && onDeactivate ? (
            <Button type="button" variant="destructive" disabled={busy} onClick={onDeactivate}>
              Deactivate supplier
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className={cn(supplierAccent)}
            disabled={busy || !draft.name.trim() || (isEdit && !dirty)}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  )
}
