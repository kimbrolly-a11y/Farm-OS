import { VerticalDetail } from "@/components/VerticalDetail";

export const dynamic = "force-dynamic";

export default async function VerticalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VerticalDetail verticalId={id} />;
}
