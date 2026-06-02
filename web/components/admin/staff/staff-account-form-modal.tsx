"use client"

import { useState } from "react"

import { DynamicModal } from "@/components/common/dynamic-modal"
import { StaffFormField, staffInputClass } from "@/components/admin/staff/staff-form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StaffRole } from "@/features/staff/api"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import { cn } from "@/lib/utils"

const staffAccent = adminPrimaryButtonClass("staff")

type StaffAccountFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: StaffRole[]
  busy?: boolean
  onSubmit: (body: {
    email: string
    password: string
    staffRoleId: string
    firstName?: string
    lastName?: string
  }) => void
}

export function StaffAccountFormModal({
  open,
  onOpenChange,
  roles,
  busy,
  onSubmit,
}: StaffAccountFormModalProps) {
  return (
    <DynamicModal
      open={open}
      onOpenChange={onOpenChange}
      title="New staff account"
      description="Create a login for a team member and assign their access role."
      compactTitle
    >
      {open ? (
        <StaffAccountFormInner
          key="create-staff"
          roles={roles}
          busy={busy}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </DynamicModal>
  )
}

function StaffAccountFormInner({
  roles,
  busy,
  onOpenChange,
  onSubmit,
}: {
  roles: StaffRole[]
  busy?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: StaffAccountFormModalProps["onSubmit"]
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [staffRoleId, setStaffRoleId] = useState("")

  const canSubmit = email.trim() && password.length >= 8 && staffRoleId

  return (
    <>
      <div className="space-y-5 px-4 py-5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <StaffFormField label="First name">
            <Input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={staffInputClass}
            />
          </StaffFormField>
          <StaffFormField label="Last name">
            <Input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={staffInputClass}
            />
          </StaffFormField>
        </div>
        <StaffFormField label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="designer@luxian.com"
            className={staffInputClass}
          />
        </StaffFormField>
        <StaffFormField label="Temporary password" required hint="Min. 8 characters">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={staffInputClass}
          />
        </StaffFormField>
        <StaffFormField label="Role" required>
          <Select value={staffRoleId} onValueChange={setStaffRoleId}>
            <SelectTrigger className={cn(staffInputClass, "w-full justify-between")}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StaffFormField>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          className={cn(staffAccent, "min-w-36")}
          disabled={busy || !canSubmit}
          onClick={() =>
            onSubmit({
              email: email.trim().toLowerCase(),
              password,
              staffRoleId,
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
            })
          }
        >
          {busy ? "Creating…" : "Create account"}
        </Button>
      </div>
    </>
  )
}
