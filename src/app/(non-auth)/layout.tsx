import NonAuthLayout from "@/components/layout/NonAuthLayout/NonAuthLayout";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function NonAuthParentLayout({ children }: LayoutProps) {
  return (
    <NonAuthLayout>
      {children}
    </NonAuthLayout>
  );
}
