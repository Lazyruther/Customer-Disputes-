"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type RefundFormData = {
  transactionId: string;
  customerEmail: string;
  reason: string;
  description: string;
  proofFileName: string;
};

type FormErrors = Partial<Record<keyof RefundFormData, string>>;

type TouchedFields = Record<keyof RefundFormData, boolean>;

const initialForm: RefundFormData = {
  transactionId: "",
  customerEmail: "",
  reason: "",
  description: "",
  proofFileName: ""
};

const initialTouched: TouchedFields = {
  transactionId: false,
  customerEmail: false,
  reason: false,
  description: false,
  proofFileName: false
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const requiredFields: (keyof RefundFormData)[] = ["transactionId", "customerEmail", "reason"];

export default function RefundRequestPage() {
  const [form, setForm] = useState<RefundFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const emailPattern = useMemo(
    () =>
      /^(?:[a-zA-Z0-9_'^&+{}=!-]+(?:\.[a-zA-Z0-9_'^&+{}=!-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    []
  );

  const isEmailValid = form.customerEmail.trim() !== "" && emailPattern.test(form.customerEmail.trim());
  const isFormValid =
    form.transactionId.trim() !== "" && isEmailValid && form.reason.trim() !== "" && !errors.proofFileName;

  function getFieldError(field: keyof RefundFormData, value: string): string | undefined {
    const trimmed = value.trim();

    switch (field) {
      case "transactionId":
        if (!trimmed) {
          return "Transaction ID is required.";
        }
        break;
      case "customerEmail":
        if (!trimmed) {
          return "Customer email is required.";
        }
        if (!emailPattern.test(trimmed)) {
          return "Enter a valid email address.";
        }
        break;
      case "reason":
        if (!trimmed) {
          return "Choose a reason for the dispute.";
        }
        break;
      default:
        break;
    }

    return undefined;
  }

  function updateFieldError(field: keyof RefundFormData, value: string) {
    const error = getFieldError(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[field] = error;
      } else {
        delete next[field];
      }
      return next;
    });
  }

  function handleChange<T extends keyof RefundFormData>(field: T, value: RefundFormData[T]) {
    setSuccessMessage(null);
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    updateFieldError(field, value);
  }

  function handleBlur<T extends keyof RefundFormData>(field: T) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    updateFieldError(field, form[field]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSuccessMessage(null);
    setTouched((prev) => ({ ...prev, proofFileName: true }));

    const file = event.target.files?.[0];

    if (!file) {
      setForm((prev) => ({ ...prev, proofFileName: "" }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.proofFileName;
        return next;
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, proofFileName: "File must be 5MB or smaller." }));
      setForm((prev) => ({ ...prev, proofFileName: "" }));
      setFileInputKey((prev) => prev + 1);
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.proofFileName;
      return next;
    });
    setForm((prev) => ({ ...prev, proofFileName: file.name }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    requiredFields.forEach((field) => {
      const error = getFieldError(field, form[field]);
      if (error) {
        nextErrors[field] = error;
      }
    });

    setErrors((prev) => {
      const updated: FormErrors = { ...prev };
      requiredFields.forEach((field) => {
        delete updated[field];
      });
      return { ...updated, ...nextErrors };
    });

    setTouched((prev) => ({ ...prev, transactionId: true, customerEmail: true, reason: true }));

    return Object.keys(nextErrors).length === 0 && !errors.proofFileName;
  }

  function generateCaseId() {
    const random = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 36).toString(36).toUpperCase()
    ).join("");
    return `RFD-${random}`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const caseId = generateCaseId();
    setSuccessMessage(
      `✅ Refund request submitted. Your Case ID is ${caseId}. We’ll get back to you within 48 hours.`
    );

    setForm({ ...initialForm });
    setTouched({ ...initialTouched });
    setErrors((prev) => {
      const next = { ...prev };
      requiredFields.forEach((field) => {
        delete next[field];
      });
      delete next.proofFileName;
      return next;
    });
    setFileInputKey((prev) => prev + 1);
  }

  return (
    <main className="min-h-screen px-4 py-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">Customer Dispute Form</h1>
          <p className="mt-2 text-sm text-slate-300">
            Submit refund details quickly so our compliance team can review and act fast.
          </p>
        </header>

        {successMessage && (
          <div
            className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100 shadow-lg"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="transactionId">
                  Transaction ID <span className="text-rose-300">*</span>
                </label>
                <input
                  id="transactionId"
                  type="text"
                  value={form.transactionId}
                  onChange={(event) => handleChange("transactionId", event.target.value)}
                  onBlur={() => handleBlur("transactionId")}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="e.g. TXN-284729"
                  required
                />
                {touched.transactionId && errors.transactionId && (
                  <p className="text-xs text-rose-400">{errors.transactionId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="customerEmail">
                  Customer Email <span className="text-rose-300">*</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={(event) => handleChange("customerEmail", event.target.value)}
                  onBlur={() => handleBlur("customerEmail")}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="customer@example.com"
                  required
                />
                {touched.customerEmail && errors.customerEmail && (
                  <p className="text-xs text-rose-400">{errors.customerEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="reason">
                  Reason for Dispute <span className="text-rose-300">*</span>
                </label>
                <select
                  id="reason"
                  value={form.reason}
                  onChange={(event) => handleChange("reason", event.target.value)}
                  onBlur={() => handleBlur("reason")}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  required
                >
                  <option value="" disabled hidden>
                    Select a reason
                  </option>
                  <option value="Product not received">Product not received</option>
                  <option value="Service issue">Service issue</option>
                  <option value="Duplicate charge">Duplicate charge</option>
                  <option value="Unauthorized charge">Unauthorized charge</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Other">Other</option>
                </select>
                {touched.reason && errors.reason && (
                  <p className="text-xs text-rose-400">{errors.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="description">
                  Description / Explanation
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  onBlur={() => handleBlur("description")}
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Provide helpful details to speed up our investigation."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="proof">
                  Upload Proof
                </label>
                <input
                  key={fileInputKey}
                  id="proof"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="w-full cursor-pointer rounded-2xl border border-dashed border-white/20 bg-slate-950/40 px-4 py-5 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white hover:border-brand-400/60"
                />
                <p className="text-xs text-slate-400">Max 5MB. Accepted formats: JPG, PNG, PDF.</p>
                {form.proofFileName && !errors.proofFileName && (
                  <p className="text-xs text-slate-300">Selected file: {form.proofFileName}</p>
                )}
                {errors.proofFileName && (
                  <p className="text-xs text-rose-400">{errors.proofFileName}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">* Required information</p>
              <button
                type="submit"
                disabled={!isFormValid}
                className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-slate-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-500/50 disabled:text-white/70"
              >
                Submit refund request
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
