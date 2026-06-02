"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  Edit02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { StaffAccountFormModal } from "@/components/admin/staff/staff-account-form-modal"
import { StaffAvatar } from "@/components/admin/staff/staff-avatar"
import { StaffRoleBadge } from "@/components/admin/staff/staff-role-badge"
import { StaffRoleFormModal } from "@/components/admin/staff/staff-role-form-modal"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createStaffRole,
  createStaffUser,
  deleteStaffRole,
  getStaffPermissions,
  getStaffRoles,
  getStaffUsers,
  updateStaffRole,
  updateStaffUser,
  type StaffRole,
  type StaffUser,
} from "@/features/staff/api"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import { toastApiError } from "@/lib/error-message"
import { cn } from "@/lib/utils"

const staffAccent = adminPrimaryButtonClass("staff")

export function AdminStaffPanel() {
  const queryClient = useQueryClient()
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null)
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const { data: permissions, isPending: permissionsLoading } = useQuery({
    queryKey: ["staff", "permissions"],
    queryFn: getStaffPermissions,
  })

  const { data: roles, isPending: rolesLoading } = useQuery({
    queryKey: ["staff", "roles"],
    queryFn: getStaffRoles,
  })

  const { data: users, isPending: usersLoading } = useQuery({
    queryKey: ["staff", "users"],
    queryFn: getStaffUsers,
  })

  const roleOptions = useMemo(() => roles ?? [], [roles])

  const invalidateStaff = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["staff", "roles"] }),
      queryClient.invalidateQueries({ queryKey: ["staff", "users"] }),
    ])
  }

  const createRoleMutation = useMutation({
    mutationFn: createStaffRole,
    onSuccess: async () => {
      await invalidateStaff()
      setRoleModalOpen(false)
      setEditingRole(null)
      toast.success("Role created")
    },
    onError: (error) => toastApiError(error),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateStaffRole>[1] }) =>
      updateStaffRole(id, body),
    onSuccess: async () => {
      await invalidateStaff()
      setRoleModalOpen(false)
      setEditingRole(null)
      toast.success("Role updated")
    },
    onError: (error) => toastApiError(error),
  })

  const deleteRoleMutation = useMutation({
    mutationFn: deleteStaffRole,
    onSuccess: async () => {
      await invalidateStaff()
      toast.success("Role deleted")
    },
    onError: (error) => toastApiError(error),
  })

  const createUserMutation = useMutation({
    mutationFn: createStaffUser,
    onSuccess: async () => {
      await invalidateStaff()
      setAccountModalOpen(false)
      toast.success("Staff account created")
    },
    onError: (error) => toastApiError(error),
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateStaffUser>[1] }) =>
      updateStaffUser(id, body),
    onSuccess: async () => {
      await invalidateStaff()
    },
    onError: (error) => toastApiError(error),
  })

  const openCreateRole = () => {
    setEditingRole(null)
    setRoleModalOpen(true)
  }

  const openEditRole = (role: StaffRole) => {
    setEditingRole(role)
    setRoleModalOpen(true)
  }

  const handleRoleSubmit = (body: {
    name: string
    slug: string
    description?: string
    permissions: Parameters<typeof createStaffRole>[0]["permissions"]
  }) => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, body })
      return
    }
    createRoleMutation.mutate(body)
  }

  const handleDeleteRole = (role: StaffRole) => {
    if (role.isSystem) return
    if (!window.confirm(`Delete role “${role.name}”? This cannot be undone.`)) return
    deleteRoleMutation.mutate(role.id)
  }

  const handleRoleChange = async (user: StaffUser, staffRoleId: string) => {
    if (!staffRoleId || staffRoleId === user.staffRoleId) return
    setUpdatingUserId(user.id)
    try {
      await updateUserMutation.mutateAsync({ id: user.id, body: { staffRoleId } })
      toast.success("Role updated")
    } catch (error) {
      toastApiError(error)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleToggleActive = async (user: StaffUser) => {
    setUpdatingUserId(user.id)
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        body: { isStaffActive: !user.isStaffActive },
      })
      toast.success(user.isStaffActive ? "Account deactivated" : "Account activated")
    } catch (error) {
      toastApiError(error)
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (permissionsLoading || rolesLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const roleBusy = createRoleMutation.isPending || updateRoleMutation.isPending

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Team access</p>
        <h2 className="font-display text-4xl font-bold uppercase text-neutral-950 sm:text-5xl">Staff</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Roles define what each person can see in the admin. Assign roles to staff accounts below.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          className={cn(staffAccent, "h-11 px-6 text-sm font-medium")}
          onClick={() => setAccountModalOpen(true)}
          disabled={roleOptions.length === 0}
        >
          <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" strokeWidth={1.8} />
          New staff account
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 border-neutral-950 px-6 text-sm font-medium text-neutral-950 hover:bg-neutral-50"
          onClick={openCreateRole}
        >
          <HugeiconsIcon icon={UserGroupIcon} className="mr-2 size-4" strokeWidth={1.8} />
          New role
        </Button>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-sm font-medium text-neutral-950">Staff accounts</h3>
          <span className="text-xs text-muted-foreground">{users?.length ?? 0} members</span>
        </div>
        <div className="overflow-hidden bg-white ring-1 ring-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[min(40%,18rem)]">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                    No staff accounts yet. Create a role, then add your first team member.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((member) => {
                  const displayName =
                    [member.firstName, member.lastName].filter(Boolean).join(" ") || "Unnamed"
                  const busy = updatingUserId === member.id

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <StaffAvatar
                            firstName={member.firstName}
                            lastName={member.lastName}
                            email={member.email}
                            roleSlug={member.staffRole?.slug}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-950">{displayName}</p>
                            <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={member.staffRoleId ?? ""}
                          onValueChange={(value) => void handleRoleChange(member, value)}
                          disabled={busy}
                        >
                          <SelectTrigger className="h-9 w-full max-w-[11rem] border-border/60 bg-white text-sm">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {member.staffRole ? (
                          <StaffRoleBadge name={member.staffRole.name} slug={member.staffRole.slug} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                        <span
                          className={cn(
                            "mt-1 block text-[11px] font-medium uppercase tracking-wide",
                            member.isStaffActive ? "text-emerald-700" : "text-red-600",
                          )}
                        >
                          {member.isStaffActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => void handleToggleActive(member)}
                        >
                          {member.isStaffActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-sm font-medium text-neutral-950">Roles</h3>
          <span className="text-xs text-muted-foreground">{roles?.length ?? 0} roles</span>
        </div>
        <div className="overflow-hidden bg-white ring-1 ring-border/60">
          {!roles?.length ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No roles defined yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {roles.map((role) => {
                const expanded = expandedRoleId === role.id
                const permissionLabels =
                  permissions?.filter((item) =>
                    role.permissions.some((p) => p.permission === item.key),
                  ) ?? []

                return (
                  <div key={role.id}>
                    <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                      <button
                        type="button"
                        className="flex size-7 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => setExpandedRoleId(expanded ? null : role.id)}
                        aria-expanded={expanded}
                        aria-label={expanded ? "Collapse role" : "Expand role"}
                      >
                        <HugeiconsIcon
                          icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
                          className="size-4"
                          strokeWidth={1.8}
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-neutral-950">{role.name}</span>
                          <StaffRoleBadge name={role.name} slug={role.slug} className="text-[10px] px-2 py-0" />
                          {role.isSystem ? (
                            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                              Preset
                            </span>
                          ) : null}
                        </div>
                        {role.description ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{role.description}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="mr-2 hidden text-xs text-muted-foreground sm:inline">
                          {role.permissions.length} permissions
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditRole(role)}
                          aria-label={`Edit ${role.name}`}
                        >
                          <HugeiconsIcon icon={Edit02Icon} className="size-4" strokeWidth={1.8} />
                        </Button>
                        {!role.isSystem ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-600 hover:text-red-700"
                            disabled={deleteRoleMutation.isPending}
                            onClick={() => handleDeleteRole(role)}
                            aria-label={`Delete ${role.name}`}
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={1.8} />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {expanded ? (
                      <div className="border-t border-border/40 bg-neutral-50/80 px-4 py-3 pb-4 sm:pl-12">
                        {role.description ? (
                          <p className="mb-2 text-sm text-muted-foreground">{role.description}</p>
                        ) : null}
                        <ul className="flex flex-wrap gap-1.5">
                          {permissionLabels.map((item) => (
                            <li
                              key={item.key}
                              className="border border-border/60 bg-white px-2 py-1 text-[11px] text-neutral-700"
                            >
                              {item.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <StaffRoleFormModal
        open={roleModalOpen}
        onOpenChange={(open) => {
          setRoleModalOpen(open)
          if (!open) setEditingRole(null)
        }}
        role={editingRole}
        permissions={permissions ?? []}
        busy={roleBusy}
        onSubmit={handleRoleSubmit}
      />

      <StaffAccountFormModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
        roles={roleOptions}
        busy={createUserMutation.isPending}
        onSubmit={(body) => createUserMutation.mutate(body)}
      />
    </div>
  )
}
