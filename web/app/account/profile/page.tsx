import { AccountProfile } from "@/components/account-profile"
import { StorePage } from "@/components/store-page"

export default function ProfilePage() {
  return (
    <StorePage narrow>
      <AccountProfile />
    </StorePage>
  )
}
