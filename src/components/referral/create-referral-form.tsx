"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReferralAction } from "@/actions/referral.actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea } from "@/components/ui";

type BusinessGroup = { id: string; name: string; code: string };

export function CreateReferralForm({ businessGroups }: { businessGroups: BusinessGroup[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const rawAnnualTax = form.get("annualTaxRevenue") as string;
    const annualTaxRevenue = rawAnnualTax ? parseFloat(rawAnnualTax) : undefined;

    const result = await createReferralAction({
      businessGroupId: form.get("businessGroupId") as string,
      customerName: (form.get("customerName") as string) || undefined,
      customerIdentifier: (form.get("customerIdentifier") as string) || undefined,
      customerEmail: (form.get("customerEmail") as string) || undefined,
      customerPhone: (form.get("customerPhone") as string) || undefined,
      annualTaxRevenue,
      subject: (form.get("subject") as string) || undefined,
      description: (form.get("description") as string) || undefined,
    });

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(`/referrals/${result.data.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Referral Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessGroupId">Business Group *</Label>
            <Select id="businessGroupId" name="businessGroupId" required>
              <option value="">Pilih business group</option>
              {businessGroups.map((bg) => (
                <option key={bg.id} value={bg.id}>
                  {bg.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Nasabah</Label>
            <Input id="customerName" name="customerName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerIdentifier">Identitas Nasabah</Label>
            <Input id="customerIdentifier" name="customerIdentifier" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telepon</Label>
              <Input id="customerPhone" name="customerPhone" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualTaxRevenue">Omset per Tahun (yang dilaporkan ke pajak)</Label>
            <Input
              id="annualTaxRevenue"
              name="annualTaxRevenue"
              type="number"
              step="1000000"
              min="0"
              placeholder="Contoh: 500000000 (Rp 500 Jt)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subjek</Label>
            <Input id="subject" name="subject" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Draft"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
