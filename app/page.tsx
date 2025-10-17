"use client";

import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState
} from "react";

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

type IconProps = ComponentPropsWithoutRef<"svg">;

type HighlightCard = {
  title: string;
  description: string;
  Icon: (props: IconProps) => JSX.Element;
};

function ShieldIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 4.5 6v5.5c0 4.9 3.3 9.7 7.5 10.5 4.2-.8 7.5-5.6 7.5-10.5V6L12 3Z" />
      <path d="m9 12.5 2.2 2.3L15 11" />
    </svg>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ConversationIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function CheckCircleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12.5 2.1 2.1L15 11" />
    </svg>
  );
}

const highlightCards: HighlightCard[] = [
  {
    title: "Secure evidence handling",
    description: "All uploaded proof is encrypted and routed only to the specialists assigned to your case.",
    Icon: ShieldIcon
  },
  {
    title: "Response within 48 hours",
    description: "Real-time routing ensures our compliance team reviews every submission in under two business days.",
    Icon: ClockIcon
  },
  {
    title: "Dedicated dispute guidance",
    description: "Chat with our agents for tailored next steps while your investigation is progressing.",
    Icon: ConversationIcon
  }
];

export default function RefundRequestPage() {
  const [form, setForm] = useState<RefundFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [activeHighlight, setActiveHighlight] = useState<string>(highlightCards[0]?.title ?? "");
  const [autoRotateHighlights, setAutoRotateHighlights] = useState(true);
  const [focusedField, setFocusedField] = useState<keyof RefundFormData | null>(null);
  const [isReasonMenuOpen, setIsReasonMenuOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const emailPattern = useMemo(
    () =>
      /^(?:[a-zA-Z0-9_'^&+{}=!-]+(?:\.[a-zA-Z0-9_'^&+{}=!-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    []
  );

  const fieldHints = useMemo<
    Record<keyof RefundFormData, string>
  >(
    () => ({
      transactionId:
        "Enter the transaction number from your statement so we can fast-track the lookup.",
      customerEmail:
        "Provide the email tied to the purchase. We use it to send updates and confirm ownership.",
      reason:
        "Choose the best fitting dispute type. This routes the request to the correct specialist.",
      description:
        "Share helpful context—dates, conversations, or product details—to strengthen your case.",
      proofFileName:
        "Upload receipts, chat transcripts, or screenshots that support your claim (max 5MB)."
    }),
    []
  );

  const highlightTitles = useMemo(
    () => highlightCards.map(({ title }) => title),
    []
  );

  const activeHighlightCard = useMemo(
    () => highlightCards.find((card) => card.title === activeHighlight),
    [activeHighlight]
  );

  useEffect(() => {
    if (!autoRotateHighlights) {
      const resumeTimer = window.setTimeout(() => setAutoRotateHighlights(true), 12000);
      return () => window.clearTimeout(resumeTimer);
    }

    if (highlightTitles.length <= 1) {
      return;
    }

    const rotationId = window.setInterval(() => {
      setActiveHighlight((current) => {
        const currentIndex = highlightTitles.indexOf(current);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % highlightTitles.length;
        return highlightTitles[nextIndex] ?? current;
      });
    }, 6000);

    return () => window.clearInterval(rotationId);
  }, [autoRotateHighlights, highlightTitles]);

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

  function handleFieldFocus<T extends keyof RefundFormData>(field: T) {
    setFocusedField(field);
  }

  function handleBlur<T extends keyof RefundFormData>(field: T) {
    setFocusedField((current) => (current === field ? null : current));
    setTouched((prev) => ({ ...prev, [field]: true }));
    updateFieldError(field, form[field]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSuccessMessage(null);
    setIsDraggingFile(false);
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

  function handleFileDragOver(event: DragEvent<HTMLInputElement>) {
    event.preventDefault();
    setIsDraggingFile(true);
  }

  function handleFileDragLeave(event?: DragEvent<HTMLInputElement>) {
    event?.preventDefault();
    setIsDraggingFile(false);
  }

  function handleHighlightInteraction(title: string) {
    setActiveHighlight(title);
    setAutoRotateHighlights(false);
  }

  function handleHighlightRest() {
    setAutoRotateHighlights(true);
  }

  function getFieldDescribedBy(field: keyof RefundFormData) {
    const ids = [`${field}-hint`];
    if (touched[field] && errors[field]) {
      ids.push(`${field}-error`);
    }
    return ids.join(" ");
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
      `Refund request submitted. Your Case ID is ${caseId}. We’ll get back to you within 48 hours.`
    );

    setForm({ ...initialForm });
    setTouched({ ...initialTouched });
    setFocusedField(null);
    setIsReasonMenuOpen(false);
    setIsDraggingFile(false);
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

        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Dispute assistance highlights"
          aria-describedby="active-highlight-description"
        >
          {highlightCards.map(({ title, description, Icon }) => {
            const isActive = title === activeHighlight;
            return (
              <button
                key={title}
                type="button"
                onClick={() => handleHighlightInteraction(title)}
                onFocus={() => handleHighlightInteraction(title)}
                onMouseEnter={() => handleHighlightInteraction(title)}
                onBlur={handleHighlightRest}
                onMouseLeave={handleHighlightRest}
                className={`highlight-card group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-left transition duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
                  isActive
                    ? "is-active border-brand-400/60 bg-slate-900/70"
                    : "hover:-translate-y-1 hover:border-brand-400/50 hover:bg-slate-900/60"
                }`}
                aria-pressed={isActive}
                aria-describedby={isActive ? "active-highlight-description" : undefined}
              >
                <span
                  className={`pointer-events-none absolute -inset-px bg-gradient-to-br from-brand-500/0 via-white/5 to-white/0 opacity-0 transition duration-500 ease-out ${
                    isActive ? "opacity-100" : "group-hover:opacity-100"
                  }`}
                  aria-hidden="true"
                />
                <div className="relative flex items-start gap-4">
                  <span
                    className={`icon-float relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-100 transition duration-500 ease-out ${
                      isActive ? "icon-pop" : ""
                    }`}
                  >
                    <span
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/40 via-brand-500/10 to-transparent opacity-0 transition duration-500 ease-out ${
                        isActive
                          ? "opacity-100"
                          : "group-hover:opacity-100 group-focus-visible:opacity-100"
                      }`}
                      aria-hidden="true"
                    />
                    <Icon
                      className="relative h-6 w-6 transition duration-500 ease-out group-hover:-translate-y-0.5 group-hover:rotate-3 group-hover:scale-110 group-focus-visible:-translate-y-0.5 group-focus-visible:-rotate-3 group-focus-visible:scale-110"
                    />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-slate-300">{description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {activeHighlightCard && (
          <p id="active-highlight-description" className="sr-only">
            {activeHighlightCard.description}
          </p>
        )}

        {successMessage && (
          <div
            className="group animate-fade-in flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100 shadow-lg"
            role="status"
            aria-live="polite"
          >
            <span className="icon-pulse relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-100 transition duration-500 ease-out group-hover:scale-105">
              <span
                className="absolute inset-0 rounded-xl bg-emerald-500/30 opacity-0 blur-lg transition duration-500 ease-out group-hover:opacity-80"
                aria-hidden="true"
              />
              <CheckCircleIcon className="relative h-6 w-6 transition duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-110" />
            </span>
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="transactionId">
                  Transaction ID <span className="text-rose-300">*</span>
                </label>
                <p id="transactionId-hint" className="sr-only">
                  {fieldHints.transactionId}
                </p>
                <input
                  id="transactionId"
                  type="text"
                  value={form.transactionId}
                  onChange={(event) => handleChange("transactionId", event.target.value)}
                  onFocus={() => handleFieldFocus("transactionId")}
                  onBlur={() => handleBlur("transactionId")}
                  className={`interactive-field w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                    focusedField === "transactionId" ? "interactive-field-active" : ""
                  }`}
                  placeholder="e.g. TXN-284729"
                  title={fieldHints.transactionId}
                  aria-describedby={getFieldDescribedBy("transactionId")}
                  required
                />
                {touched.transactionId && errors.transactionId && (
                  <p id="transactionId-error" className="text-xs text-rose-400">
                    {errors.transactionId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="customerEmail">
                  Customer Email <span className="text-rose-300">*</span>
                </label>
                <p id="customerEmail-hint" className="sr-only">
                  {fieldHints.customerEmail}
                </p>
                <input
                  id="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={(event) => handleChange("customerEmail", event.target.value)}
                  onFocus={() => handleFieldFocus("customerEmail")}
                  onBlur={() => handleBlur("customerEmail")}
                  className={`interactive-field w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                    focusedField === "customerEmail" ? "interactive-field-active" : ""
                  }`}
                  placeholder="customer@example.com"
                  title={fieldHints.customerEmail}
                  aria-describedby={getFieldDescribedBy("customerEmail")}
                  required
                />
                {touched.customerEmail && errors.customerEmail && (
                  <p id="customerEmail-error" className="text-xs text-rose-400">
                    {errors.customerEmail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="reason">
                  Reason for Dispute <span className="text-rose-300">*</span>
                </label>
                <p id="reason-hint" className="sr-only">
                  {fieldHints.reason}
                </p>
                <div className="relative">
                  <select
                    id="reason"
                    value={form.reason}
                    onChange={(event) => {
                      handleChange("reason", event.target.value);
                      setIsReasonMenuOpen(false);
                    }}
                    onFocus={() => {
                      handleFieldFocus("reason");
                      setIsReasonMenuOpen(true);
                    }}
                    onBlur={() => {
                      handleBlur("reason");
                      setIsReasonMenuOpen(false);
                    }}
                    onMouseDown={() => setIsReasonMenuOpen(true)}
                    onKeyDown={(event) => {
                      if ([" ", "Enter", "ArrowDown", "ArrowUp"].includes(event.key)) {
                        setIsReasonMenuOpen(true);
                      }
                    }}
                    className={`interactive-field w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 pr-12 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                      focusedField === "reason" || isReasonMenuOpen ? "interactive-field-active" : ""
                    }`}
                    title={fieldHints.reason}
                    aria-describedby={getFieldDescribedBy("reason")}
                    aria-expanded={isReasonMenuOpen}
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
                  <span
                    className={`select-chevron pointer-events-none absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-xs transition-all duration-300 ease-out ${
                      isReasonMenuOpen ? "rotate-180 bg-brand-500/20 text-brand-100" : "bg-white/5 text-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </div>
                {touched.reason && errors.reason && (
                  <p id="reason-error" className="text-xs text-rose-400">
                    {errors.reason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="description">
                  Description / Explanation
                </label>
                <p id="description-hint" className="sr-only">
                  {fieldHints.description}
                </p>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  onFocus={() => handleFieldFocus("description")}
                  onBlur={() => handleBlur("description")}
                  className={`interactive-field min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                    focusedField === "description" ? "interactive-field-active" : ""
                  }`}
                  placeholder="Provide helpful details to speed up our investigation."
                  title={fieldHints.description}
                  aria-describedby={getFieldDescribedBy("description")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="proof">
                  Upload Proof
                </label>
                <p id="proofFileName-hint" className="sr-only">
                  {fieldHints.proofFileName}
                </p>
                <input
                  key={fileInputKey}
                  id="proof"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  onFocus={() => handleFieldFocus("proofFileName")}
                  onBlur={() => handleBlur("proofFileName")}
                  onDragEnter={handleFileDragOver}
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDragLeave}
                  className={`interactive-field file-input w-full cursor-pointer rounded-2xl border border-dashed border-white/20 bg-slate-950/40 px-4 py-5 text-sm text-slate-300 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white hover:border-brand-400/60 ${
                    focusedField === "proofFileName" || isDraggingFile ? "interactive-field-active file-drop-active" : ""
                  }`}
                  title={fieldHints.proofFileName}
                  aria-describedby={getFieldDescribedBy("proofFileName")}
                />
                <p className="text-xs text-slate-400">Max 5MB. Accepted formats: JPG, PNG, PDF.</p>
                {form.proofFileName && !errors.proofFileName && (
                  <p className="text-xs text-slate-300">Selected file: {form.proofFileName}</p>
                )}
                {errors.proofFileName && (
                  <p id="proofFileName-error" className="text-xs text-rose-400">
                    {errors.proofFileName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">* Required information</p>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`interactive-button inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-slate-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-500/50 disabled:text-white/70 ${
                  isFormValid ? "interactive-button-active" : ""
                }`}
                title={isFormValid ? "Submit your refund request" : "Complete required fields to enable submission"}
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
