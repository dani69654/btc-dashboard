import { AddressView } from "@/components/address/AddressView";

export default async function AddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <AddressView address={decodeURIComponent(address)} />;
}
