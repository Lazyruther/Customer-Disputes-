"use client";

import { FormEvent, useMemo, useState } from "react";

type RefundFormData = {
  transactionId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  description: string;
  proofFileName: string;
};

type FormErrors = Partial<Record<keyof RefundFormData, string>> & {
  customerEmail?: string;
};

type RefundConfirmation = RefundFormData & {
  refundId: string;
  submittedAt: string;
};

const initialForm: RefundFormData = {
  transactionId: "",
  orderId: "",
  customerName: "",
  customerEmail: "",
  description: "",
  proofFileName: ""
};

export default function RefundRequestPage() {
  const [form, setForm] = useState<RefundFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmation, setConfirmation] = useState<RefundConfirmation | null>(null);

  const emailPattern = useMemo(
    () =>
      /^(?:[a-zA-Z0-9_'^&+{}=!-]+(?:\.[a-zA-Z0-9_'^&+{}=!-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    []
  );

  function handleChange<T extends keyof RefundFormData>(field: T, value: RefundFormData[T]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.transactionId.trim()) {
      nextErrors.transactionId = "Transaction ID is required.";
    }

    if (form.customerEmail.trim() && !emailPattern.test(form.customerEmail.trim())) {
      nextErrors.customerEmail = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const refundId = `RF-${Date.now().toString(36).toUpperCase()}`;
    const submittedAt = new Date().toISOString();

    const submission: RefundConfirmation = {
      ...form,
      refundId,
      submittedAt
    };

    try {
      if (typeof window !== "undefined") {
        const historyKey = "refundSubmissions";
        const existing = window.localStorage.getItem(historyKey);
        const history = existing ? JSON.parse(existing) : [];
        history.unshift(submission);
        window.localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20)));
      }
    } catch (storageError) {
      console.warn("Unable to persist submission to localStorage", storageError);
    }

    setConfirmation(submission);
    setForm(initialForm);
  }

  return (
    <main className="px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">Customer Dispute Form</h1>
          <p className="mt-2 text-sm text-slate-300">
            Submit refund details quickly so our compliance team can review and act fast.
          </p>
        </header>

        <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Transaction ID *</label>
                <input
                  type="text"
                  value={form.transactionId}
                  onChange={(event) => handleChange("transactionId", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="e.g. TXN-284729"
                  required
                />
                {errors.transactionId && (
                  <p className="text-xs text-rose-400">{errors.transactionId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Order ID</label>
                <input
                  type="text"
                  value={form.orderId}
                  onChange={(event) => handleChange("orderId", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Optional order reference"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Customer Name</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(event) => handleChange("customerName", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Customer Email</label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(event) => handleChange("customerEmail", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="customer@example.com"
                />
                {errors.customerEmail && (
                  <p className="text-xs text-rose-400">{errors.customerEmail}</p>
                )}
              </div>

              
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description / Explanation</label>
              <textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Share any supporting context, reference numbers, or agent notes."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Upload Proof</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  handleChange("proofFileName", file ? file.name : "");
                }}
                className="w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-slate-900/50 px-4 py-5 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white hover:border-brand-400/50"
              />
              {form.proofFileName && (
                <p className="text-xs text-slate-400">Selected file: {form.proofFileName}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Fields marked with * are required.</p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Submit Refund Request
              </button>
            </div>
          </form>
        </section>

        {confirmation && (
          <section className="mx-auto w-full max-w-3xl rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-50 shadow-lg sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold">Refund Submitted</h2>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-200">{confirmation.submittedAt}</div>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-emerald-200/80">Refund ID</dt>
                <dd className="font-medium text-white">{confirmation.refundId}</dd>
              </div>
              <div>
                <dt className="text-emerald-200/80">Transaction ID</dt>
                <dd className="font-medium text-white">{confirmation.transactionId}</dd>
              </div>
              {confirmation.orderId && (
                <div>
                  <dt className="text-emerald-200/80">Order ID</dt>
                  <dd className="font-medium text-white">{confirmation.orderId}</dd>
                </div>
              )}
              {confirmation.customerName && (
                <div>
                  <dt className="text-emerald-200/80">Customer</dt>
                  <dd className="font-medium text-white">{confirmation.customerName}</dd>
                </div>
              )}
              {confirmation.customerEmail && (
                <div>
                  <dt className="text-emerald-200/80">Email</dt>
                  <dd className="font-medium text-white">{confirmation.customerEmail}</dd>
                </div>
              )}
              {confirmation.description && (
                <div className="sm:col-span-2">
                  <dt className="text-emerald-200/80">Description</dt>
                  <dd className="font-medium text-white">{confirmation.description}</dd>
                </div>
              )}
              {confirmation.proofFileName && (
                <div className="sm:col-span-2">
                  <dt className="text-emerald-200/80">Proof</dt>
                  <dd className="font-medium text-white">{confirmation.proofFileName}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}
