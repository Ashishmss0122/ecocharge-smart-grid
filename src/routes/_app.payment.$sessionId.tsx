import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Receipt } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBlock, LoadingBlock } from "@/components/States";
import { Button } from "@/components/ui/button";
import { getPaymentBySession, payPayment } from "@/services/payments";
import { formatDateTime, INR, kwh, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/payment/$sessionId")({
  component: PaymentPage,
});

const METHODS = ["UPI", "Card", "Wallet"] as const;

function PaymentPage() {
  const { sessionId } = Route.useParams();
  const queryClient = useQueryClient();
  const paymentQ = useQuery({
    queryKey: ["payment", sessionId],
    queryFn: () => getPaymentBySession(sessionId),
  });

  const [method, setMethod] = useState<(typeof METHODS)[number]>("UPI");
  const [busy, setBusy] = useState(false);

  if (paymentQ.isLoading) return <LoadingBlock label="Loading your bill…" />;
  if (paymentQ.error || !paymentQ.data)
    return <ErrorBlock message="No payment found for this session yet." />;

  const p = paymentQ.data;
  const paid = p.status === "paid";

  async function handlePay() {
    setBusy(true);
    try {
      await payPayment(p.id);
      await Promise.all([
        paymentQ.refetch(),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
      ]);
      toast.success("Payment successful");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-2xl font-bold">
          {paid ? "Payment receipt" : "Complete your payment"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {p.stations?.name ?? "Station"} · {shortId(p.id)}
        </p>

        <div className="glass mt-6 rounded-2xl p-6">
          <dl className="space-y-3 text-sm">
            <Row label="Energy delivered" value={kwh(Number(p.energy_kwh))} />
            <Row label="Rate" value={`${INR(Number(p.rate_per_kwh))}/kWh`} />
            <Row label="Energy cost" value={INR(Number(p.energy_kwh) * Number(p.rate_per_kwh))} />
            <Row label="Service fee" value={INR(Number(p.service_fee))} />
            {p.paid_at && <Row label="Paid on" value={formatDateTime(p.paid_at)} />}
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total payable</span>
            <span className="font-display text-2xl font-bold text-primary">
              {INR(Number(p.total_amount))}
            </span>
          </div>
        </div>

        {paid ? (
          <div className="glass-glow mt-6 flex items-center gap-3 rounded-2xl p-5">
            <CheckCircle2 className="size-6 text-primary" />
            <div>
              <p className="font-semibold">Payment complete</p>
              <p className="text-xs text-muted-foreground">
                Paid via {p.method}. A receipt is saved in your history.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass mt-6 rounded-2xl p-5">
            <p className="text-sm font-semibold">Payment method</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm transition-colors",
                    method === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Button className="mt-5 w-full" size="lg" disabled={busy} onClick={handlePay}>
              <CreditCard className="size-4" />
              {busy ? "Processing…" : `Pay ${INR(Number(p.total_amount))}`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Simulated checkout — no real money is charged.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/history">
              <Receipt className="size-4" /> History
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/stations">Book again</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
