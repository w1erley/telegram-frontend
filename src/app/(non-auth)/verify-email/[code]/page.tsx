import VerifyEmail from "@/components/features/Auth/VerifyEmail"

export default function VerifyEmailPage({ params }: { params: { code: string } }) {
  return <VerifyEmail code={params.code} />
}
