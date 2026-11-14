import { z } from "zod";

export interface FormConfig {
  schema: z.ZodObject<z.ZodRawShape>;
  notifyEmail: string;
  subject: string;
  confirmationSubject: string;
  requiredFields: string[];
  optionalFields: string[];
}

// TODO(client): confirm the inbox for each form (private events may go to the event manager).
const NOTIFY = "info@hublouisville.com";

const optional = z.string().trim().max(500).optional();

const formConfigs: Record<string, FormConfig> = {
  "contact": {
    schema: z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().email(),
      phone: optional,
      message: z.string().trim().min(1).max(5000),
    }),
    requiredFields: ["name", "email", "message"],
    optionalFields: ["phone"],
    notifyEmail: NOTIFY,
    subject: "New Contact Form Submission",
    confirmationSubject: "We received your message",
  },
  "vip": {
    schema: z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().email(),
      phone: z.string().trim().min(7).max(30),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => {
        const day = new Date(`${d}T12:00:00`).getDay();
        return day === 5 || day === 6;
      }, "VIP booths are Friday and Saturday only"),
      guests: z.coerce.string().regex(/^\d{1,3}$/),
      occasion: optional,
      mixers: optional,
      signMessage: optional,
      decor: optional,
      terms: z.literal("Yes"),
      message: z.string().trim().max(5000).optional(),
    }),
    requiredFields: ["name", "phone", "email", "date", "guests", "terms"],
    optionalFields: ["occasion", "mixers", "signMessage", "decor", "message"],
    notifyEmail: NOTIFY,
    subject: "New VIP Table Request",
    confirmationSubject: "We received your VIP request",
  },
  "private-event": {
    schema: z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().email(),
      phone: z.string().trim().min(7).max(30),
      date: optional,
      guests: z.coerce.string().max(10).optional(),
      eventType: optional,
      message: z.string().trim().min(1).max(5000),
    }),
    requiredFields: ["name", "phone", "email", "message"],
    optionalFields: ["date", "guests", "eventType"],
    notifyEmail: NOTIFY,
    subject: "New Private Event Inquiry",
    confirmationSubject: "We received your event inquiry",
  },
};

export default formConfigs;
