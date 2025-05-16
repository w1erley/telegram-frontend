import { getCookies } from "next-client-cookies/server";
import { redirect } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout/AuthLayout";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function AuthParentLayout({ children }: LayoutProps) {
  const cookies = await getCookies();

  if (!cookies.get("access_token")) {
    redirect(`/`);
  }

  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
}
