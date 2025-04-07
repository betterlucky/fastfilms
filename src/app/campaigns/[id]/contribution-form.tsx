"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContributionFormProps {
  campaignId: string;
  minAmount: number;
}

export function ContributionForm({ campaignId, minAmount }: ContributionFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < minAmount) {
      setError(`Minimum contribution is £${minAmount}`);
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: numericAmount }),
      });

      if (!response.ok) {
        throw new Error("Failed to process contribution");
      }

      const data = await response.json();
      router.push(`/tickets/confirmation?ticketId=${data.ticketId}`);
    } catch (err) {
      setError("Failed to process contribution. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Contribution Amount (£)
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
          <Input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minAmount}
            step="0.01"
            className="block w-full rounded-md border-0 pl-7 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Minimum contribution: £{minAmount}
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Contribute
      </Button>
    </form>
  );
} 