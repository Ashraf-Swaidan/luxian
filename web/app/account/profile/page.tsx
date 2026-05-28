import { AccountProfile } from "@/components/auth/account-profile"
import { StorePage } from "@/components/layout/store-page"

export default function ProfilePage() {
  return (
    <StorePage narrow>
      <AccountProfile />
    </StorePage>
  )
}
