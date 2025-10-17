"use client";

import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

function FileTextIcon(props: IconProps) {
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
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function ImageIcon(props: IconProps) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m21 15-3.5-3.5a2 2 0 0 0-2.9 0L7 20" />
    </svg>
  );
}

function FilePdfIcon(props: IconProps) {
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
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8.5 17v-4H11" />
      <path d="M8.5 15H11" />
      <path d="M12.5 13v4" />
      <path d="M12.5 15H14" />
      <path d="M15.5 17v-4h2a1 1 0 0 1 0 2h-2" />
    </svg>
  );
}

function getFileIconType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    return "file" as const;
  }

  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
    return "image" as const;
  }

  if (extension === "pdf") {
    return "pdf" as const;
  }

  return "file" as const;
}

const reasonOptions = [
  "Product not received",
  "Product doesn't work",
  "General service issue",
  "Duplicate charge",
  "Unauthorized charge",
  "Fraud",
  "Other"
] as const;

type ReasonOption = (typeof reasonOptions)[number];

export default function RefundRequestPage() {
  const [form, setForm] = useState<RefundFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [isReasonMenuOpen, setIsReasonMenuOpen] = useState(false);
  const reasonMenuRef = useRef<HTMLDivElement | null>(null);
  const fileIconType = useMemo(() => getFileIconType(form.proofFileName), [form.proofFileName]);

  const emailPattern = useMemo(
    () =>
      /^(?:[a-zA-Z0-9_'^&+{}=!-]+(?:\.[a-zA-Z0-9_'^&+{}=!-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 
    []
  );

  const isEmailValid = form.customerEmail.trim() !== "" && emailPattern.test(form.customerEmail.trim());
  const isFormValid =
    form.transactionId.trim() !== "" && isEmailValid && form.reason.trim() !== "" && !errors.proofFileName;

  const selectedReason = useMemo<ReasonOption | "">(() => {
    return reasonOptions.find((option) => option === form.reason) ?? "";
  }, [form.reason]);

  const markReasonTouched = useCallback((value: string) => {
    setTouched((prev) => ({ ...prev, reason: true }));
    setErrors((prev) => {
      const next = { ...prev };
      const trimmed = value.trim();
      if (!trimmed) {
        next.reason = "Choose a reason for the dispute.";
      } else {
        delete next.reason;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isReasonMenuOpen || !reasonMenuRef.current) {
        return;
      }

      if (!reasonMenuRef.current.contains(event.target as Node)) {
        setIsReasonMenuOpen(false);
        markReasonTouched(form.reason);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [form.reason, isReasonMenuOpen, markReasonTouched]);

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
      setProofPreview(null);
      setPreviewLoaded(false);
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
      setProofPreview(null);
      setPreviewLoaded(false);
      setFileInputKey((prev) => prev + 1);
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.proofFileName;
      return next;
    });
    setForm((prev) => ({ ...prev, proofFileName: file.name }));

    if (file.type.startsWith("image/")) {
      setPreviewLoaded(false);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(typeof reader.result === "string" ? reader.result : null);
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
      setPreviewLoaded(false);
    }
  }

  const handleRemoveFile = useCallback(() => {
    setForm((prev) => ({ ...prev, proofFileName: "" }));
    setProofPreview(null);
    setPreviewLoaded(false);
    setTouched((prev) => ({ ...prev, proofFileName: false }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.proofFileName;
      return next;
    });
    setFileInputKey((prev) => prev + 1);
  }, []);

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
    setErrors((prev) => {
      const next = { ...prev };
      requiredFields.forEach((field) => {
        delete next[field];
      });
      delete next.proofFileName;
      return next;
    });
    setFileInputKey((prev) => prev + 1);
    setProofPreview(null);
    setPreviewLoaded(false);
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
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="group flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-left text-sm text-emerald-100 shadow-lg transition-transform duration-300 ease-in-out hover:scale-[1.01] hover:shadow-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95"
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
          </button>
        )}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-brand-900/30 focus-within:-translate-y-1 focus-within:shadow-brand-900/30 backdrop-blur-sm sm:p-10">
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 transition duration-200 ease-in-out focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 hover:border-brand-300/60"
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 transition duration-200 ease-in-out focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 hover:border-brand-300/60"
                  placeholder="your@example.com"
                  required
                />
                {touched.customerEmail && errors.customerEmail && (
                  <p className="text-xs text-rose-400">{errors.customerEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" htmlFor="reason-toggle">
                  Reason for Dispute <span className="text-rose-300">*</span>
                </label>
                <div className="relative" ref={reasonMenuRef}>
                  <button
                    id="reason-toggle"
                    type="button"
                    onClick={() => setIsReasonMenuOpen((prev) => !prev)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setIsReasonMenuOpen((prev) => !prev);
                        return;
                      }

                      if (event.key === "Escape") {
                        event.preventDefault();
                        setIsReasonMenuOpen(false);
                        markReasonTouched(form.reason);
                      }
                    }}
                    onBlur={() => {
                      if (!isReasonMenuOpen) {
                        handleBlur("reason");
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isReasonMenuOpen}
                    className={`flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-sm transition duration-200 ease-in-out hover:border-brand-300/60 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                      isReasonMenuOpen ? "ring-2 ring-brand-400" : ""
                    }`}
                  >
                    <span className={selectedReason ? "text-white" : "text-slate-400"}>
                      {selectedReason || "Select a reason"}
                    </span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ease-in-out ${
                        isReasonMenuOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <div
                    role="listbox"
                    aria-label="Dispute reasons"
                    className={`absolute left-0 right-0 top-full z-10 mt-2 origin-top rounded-2xl border border-white/10 bg-slate-950/90 p-1 text-sm shadow-xl backdrop-blur transition-all duration-200 ease-out ${
                      isReasonMenuOpen
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }`}
                  >
                    {reasonOptions.map((option) => {
                      const isSelected = option === selectedReason;
                      return (
                        <button
                          type="button"
                          key={option}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            handleChange("reason", option);
                            setIsReasonMenuOpen(false);
                            handleBlur("reason");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              setIsReasonMenuOpen(false);
                              markReasonTouched(form.reason);
                              const toggle = document.getElementById("reason-toggle") as HTMLButtonElement | null;
                              toggle?.focus();
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 hover:bg-brand-500/10 ${
                            isSelected ? "bg-brand-500/20 text-brand-100" : "text-slate-200"
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m9 12.5 2.1 2.1L15 11" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm placeholder:text-slate-500 transition duration-200 ease-in-out focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 hover:border-brand-300/60"
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
                  className="w-full cursor-pointer rounded-2xl border border-dashed border-white/20 bg-slate-950/40 px-4 py-5 text-sm text-slate-300 transition duration-200 ease-in-out hover:border-brand-400/60 hover:bg-slate-950/60 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white"
                />
                <p className="text-xs text-slate-400">Max 5MB. Accepted formats: JPG, PNG, PDF.</p>
                <div className="flex items-center gap-3">
                  {form.proofFileName ? (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-lg transition duration-200 ease-in-out hover:-translate-y-0.5 hover:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                      aria-label={proofPreview ? "Remove uploaded image" : "Remove uploaded file"}
                    >
                      {proofPreview ? (
                        <>
                          <img
                            src={proofPreview}
                            alt="Uploaded proof preview"
                            onLoad={() => setPreviewLoaded(true)}
                            className={`h-full w-full object-cover transition-opacity duration-300 ${
                              previewLoaded ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 opacity-0 transition duration-200 ease-in-out group-hover:opacity-100">
                            Click to remove
                          </span>
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300 transition duration-200 ease-in-out group-hover:text-brand-200">
                          {fileIconType === "pdf" ? (
                            <FilePdfIcon className="h-8 w-8 text-rose-300" />
                          ) : (
                            <FileTextIcon className="h-8 w-8 text-slate-300" />
                          )}
                          <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 opacity-0 transition duration-200 ease-in-out group-hover:opacity-100">
                            Click to remove
                          </span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-950/40 text-slate-500 shadow-inner">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  {form.proofFileName && !errors.proofFileName ? (
                    <div className="flex-1 rounded-xl border border-white/5 bg-slate-950/50 px-3 py-2 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        {proofPreview ? (
                          <ImageIcon className="h-4 w-4 text-brand-300" />
                        ) : fileIconType === "pdf" ? (
                          <FilePdfIcon className="h-4 w-4 text-rose-300" />
                        ) : (
                          <FileTextIcon className="h-4 w-4 text-slate-300" />
                        )}
                        <span className="truncate" title={form.proofFileName}>
                          {form.proofFileName}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">Click the preview to remove and upload a different file.</p>
                    </div>
                  ) : null}
                </div>
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
