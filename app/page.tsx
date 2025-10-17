"use client";

import {
  ChangeEvent,
  ComponentPropsWithoutRef,
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

type LiveStat = {
  title: string;
  value: number;
  unit?: string;
  delta: string;
  description: string;
  completion: number;
  accent: "emerald" | "sky" | "amber";
};

type TimelineStage = {
  title: string;
  eta: string;
  description: string;
  tip: string;
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

const statAccentTheme: Record<LiveStat["accent"], { active: string; idle: string; bar: string; chip: string }> = {
  emerald: {
    active: "border-emerald-400/60 bg-emerald-500/20 shadow-lg shadow-emerald-500/20",
    idle: "border-white/10 bg-slate-900/60 hover:border-emerald-400/40 hover:bg-emerald-500/10",
    bar: "from-emerald-400 via-emerald-300 to-emerald-500",
    chip: "border border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
  },
  sky: {
    active: "border-sky-400/60 bg-sky-500/20 shadow-lg shadow-sky-500/20",
    idle: "border-white/10 bg-slate-900/60 hover:border-sky-400/40 hover:bg-sky-500/10",
    bar: "from-sky-400 via-sky-300 to-sky-500",
    chip: "border border-sky-400/40 bg-sky-500/15 text-sky-100"
  },
  amber: {
    active: "border-amber-400/60 bg-amber-500/20 shadow-lg shadow-amber-500/20",
    idle: "border-white/10 bg-slate-900/60 hover:border-amber-400/40 hover:bg-amber-500/10",
    bar: "from-amber-400 via-amber-300 to-amber-500",
    chip: "border border-amber-400/40 bg-amber-500/15 text-amber-100"
  }
};

const liveStats: LiveStat[] = [
  {
    title: "Active investigations",
    value: 42,
    delta: "+8 today",
    description: "Compliance specialists are actively reviewing these cases with evidence attached.",
    completion: 72,
    accent: "emerald"
  },
  {
    title: "Awaiting merchant response",
    value: 18,
    unit: "cases",
    delta: "avg. 29h",
    description: "We have contacted the merchant and are waiting on additional documentation.",
    completion: 54,
    accent: "amber"
  },
  {
    title: "Refunds approved this week",
    value: 31,
    unit: "cases",
    delta: "+14% vs last week",
    description: "Customers have been notified and payouts are now being processed.",
    completion: 88,
    accent: "sky"
  }
];

const timelineStages: TimelineStage[] = [
  {
    title: "Submission triage",
    eta: "0 - 4 hours",
    description: "An automated review checks for duplicates, validates document quality, and prioritises urgent fraud cases.",
    tip: "Keep push notifications on so you never miss a question from our triage bot."
  },
  {
    title: "Investigator assignment",
    eta: "4 - 12 hours",
    description: "The case is routed to a compliance specialist with experience in your industry to evaluate the evidence.",
    tip: "Adding transaction notes speeds up the specialist’s fact-finding."
  },
  {
    title: "Merchant collaboration",
    eta: "12 - 48 hours",
    description: "We reach out to the merchant for their records and compare them with the documents you provided.",
    tip: "Upload receipts or screenshots that clearly show amounts and dates."
  },
  {
    title: "Resolution & payout",
    eta: "48 - 72 hours",
    description: "Once we’ve confirmed the outcome, we release the refund and email the full case summary for your records.",
    tip: "Track the status in your dashboard or request a call-back for complex disputes."
  }
];

export default function RefundRequestPage() {
  const [form, setForm] = useState<RefundFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>(initialTouched);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [activeHighlight, setActiveHighlight] = useState<string>(highlightCards[0]?.title ?? "");
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [activeStage, setActiveStage] = useState<string>(timelineStages[0]?.title ?? "");
  const [evidenceConfidence, setEvidenceConfidence] = useState(68);
  const [merchantResponseHours, setMerchantResponseHours] = useState(36);

  const activeTimelineStage = useMemo(
    () => timelineStages.find((stage) => stage.title === activeStage) ?? timelineStages[0],
    [activeStage]
  );

  const activeStat = liveStats[activeStatIndex] ?? liveStats[0];

  const emailPattern = useMemo(
    () =>
      /^(?:[a-zA-Z0-9_'^&+{}=!-]+(?:\.[a-zA-Z0-9_'^&+{}=!-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    []
  );

  useEffect(() => {
    if (liveStats.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % liveStats.length);
    }, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const responseModifier = 1 - Math.min(merchantResponseHours / 72, 1);
  const estimatedResolutionDays = Math.max(
    2,
    Math.min(14, Math.round(12 - (evidenceConfidence / 100) * 5 - responseModifier * 4))
  );
  const approvalProbability = Math.max(
    24,
    Math.min(96, Math.round(45 + (evidenceConfidence / 100) * 40 + responseModifier * 8))
  );
  const expediteScore = Math.max(
    10,
    Math.min(100, Math.round(evidenceConfidence * 0.55 + responseModifier * 45))
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
        >
          {highlightCards.map(({ title, description, Icon }) => {
            const isActive = title === activeHighlight;
            return (
              <button
                key={title}
                type="button"
                onClick={() => setActiveHighlight(title)}
                onFocus={() => setActiveHighlight(title)}
                onMouseEnter={() => setActiveHighlight(title)}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-left transition duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
                  isActive
                    ? "border-brand-400/60 bg-slate-900/70 shadow-lg shadow-brand-900/40"
                    : "hover:-translate-y-1 hover:border-brand-400/50 hover:bg-slate-900/60"
                }`}
                aria-pressed={isActive}
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

        <section
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm sm:p-10"
          aria-label="Live dispute insights"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Live dispute insights</h2>
              <p className="mt-1 text-sm text-slate-300">
                Hover or focus each widget to spotlight what our dispute desk is prioritising right now.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold shadow ${statAccentTheme[activeStat.accent].chip}`}
            >
              Highlight • {activeStat.delta}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {liveStats.map((stat, index) => {
              const isActive = index === activeStatIndex;
              const accent = statAccentTheme[stat.accent];

              return (
                <button
                  key={stat.title}
                  type="button"
                  onClick={() => setActiveStatIndex(index)}
                  onFocus={() => setActiveStatIndex(index)}
                  onMouseEnter={() => setActiveStatIndex(index)}
                  className={`live-stat-card group relative flex h-full flex-col justify-between rounded-2xl border px-5 py-6 text-left transition duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
                    isActive ? `is-active ${accent.active}` : accent.idle
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{stat.title}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${accent.chip}`}
                      >
                        {stat.delta}
                      </span>
                    </div>
                    <p className="text-3xl font-semibold text-white">
                      {stat.value}
                      {stat.unit ? (
                        <span className="ml-1 text-base font-medium text-slate-200">{stat.unit}</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="progress-track relative h-2 overflow-hidden rounded-full bg-slate-800/80">
                      <span
                        className={`stat-progress block h-full rounded-full bg-gradient-to-r ${accent.bar}`}
                        style={{ width: `${stat.completion}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{activeStat.title}</p>
              <p className="mt-1 max-w-xl text-slate-300">{activeStat.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="uppercase tracking-wide text-slate-400">Completion</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-sm font-semibold text-white">
                {activeStat.completion}%
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Investigation journey</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Follow your refund as it moves through each specialised review stage.
                </p>
              </div>
              <span className="rounded-full border border-brand-300/40 bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
                {activeTimelineStage.eta}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-3">
                {timelineStages.map((stage) => {
                  const isActive = stage.title === activeStage;
                  return (
                    <button
                      key={stage.title}
                      type="button"
                      onClick={() => setActiveStage(stage.title)}
                      onFocus={() => setActiveStage(stage.title)}
                      onMouseEnter={() => setActiveStage(stage.title)}
                      className={`timeline-step group relative flex items-start gap-4 rounded-2xl border px-4 py-4 text-left transition duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
                        isActive
                          ? "border-brand-400/60 bg-brand-500/10"
                          : "border-white/10 hover:border-brand-400/40 hover:bg-slate-900/60"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`timeline-node relative mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                          isActive
                            ? "bg-brand-500/30 text-brand-100"
                            : "bg-slate-800/80 text-slate-200"
                        }`}
                        aria-hidden="true"
                      >
                        <span className="timeline-node-glow" />
                        {stage.title
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{stage.title}</p>
                        <p className="mt-1 text-xs text-slate-300">{stage.eta}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <aside className="timeline-detail relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-300">
                <span className="timeline-detail-gradient" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white">What’s happening now</h3>
                <p className="mt-2 leading-relaxed">{activeTimelineStage.description}</p>
                <div className="mt-4 rounded-2xl border border-brand-400/30 bg-brand-500/10 p-4 text-brand-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-100/80">Tip</p>
                  <p className="mt-1 text-sm text-brand-50">{activeTimelineStage.tip}</p>
                </div>
              </aside>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">Outcome estimator</h2>
            <p className="mt-1 text-sm text-slate-300">
              Adjust the sliders to simulate how evidence quality and merchant speed influence the resolution.
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm font-medium text-white">
                  <label htmlFor="evidence-confidence">Evidence confidence</label>
                  <span>{evidenceConfidence}%</span>
                </div>
                <div className="mt-3">
                  <input
                    id="evidence-confidence"
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={evidenceConfidence}
                    onChange={(event) => setEvidenceConfidence(Number(event.target.value))}
                    className="range-input"
                  />
                  <div className="progress-track mt-2 h-2 overflow-hidden rounded-full bg-slate-800/80">
                    <span
                      className="progress-glow block h-full rounded-full bg-gradient-to-r from-emerald-400 via-brand-400 to-brand-500"
                      style={{ width: `${evidenceConfidence}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Higher-quality documents reduce manual follow-ups and push your dispute closer to the front of the queue.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm font-medium text-white">
                  <label htmlFor="merchant-response">Merchant response speed</label>
                  <span>{merchantResponseHours}h</span>
                </div>
                <div className="mt-3">
                  <input
                    id="merchant-response"
                    type="range"
                    min={12}
                    max={72}
                    step={4}
                    value={merchantResponseHours}
                    onChange={(event) => setMerchantResponseHours(Number(event.target.value))}
                    className="range-input"
                  />
                  <div className="progress-track mt-2 h-2 overflow-hidden rounded-full bg-slate-800/80">
                    <span
                      className="progress-glow block h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500"
                      style={{ width: `${(merchantResponseHours / 72) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  The quicker the merchant responds, the faster we can reconcile evidence and approve your refund.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="stat-outcome-card rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resolution window</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {estimatedResolutionDays}-{estimatedResolutionDays + 2} days
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Based on current queue depth and provided supporting evidence.
                </p>
              </div>
              <div className="stat-outcome-card rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Approval likelihood</p>
                <p className="mt-2 text-2xl font-semibold text-white">{approvalProbability}%</p>
                <p className="mt-2 text-xs text-slate-400">
                  Strong documentation increases confidence in a customer-favourable outcome.
                </p>
              </div>
              <div className="stat-outcome-card rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expedite readiness</p>
                <p className="mt-2 text-2xl font-semibold text-white">{expediteScore}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Scores above 80 qualify for priority routing by our escalations team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {successMessage && (
          <div
            className="group flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100 shadow-lg"
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
