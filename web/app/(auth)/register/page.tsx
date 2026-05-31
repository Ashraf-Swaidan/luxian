import { AuthShowcaseLayout } from "@/components/auth/auth-showcase-layout"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthShowcaseLayout
      eyebrow="New account"
      title="Join Luxian"
      body="Create your account for faster checkout, order tracking, and curated drops."
      imageSrc="/hero-assets/signup-hero.png"
      imageAlt="Luxian editorial signup campaign"
      reverse
    >
      <RegisterForm />
    </AuthShowcaseLayout>
  )
}
