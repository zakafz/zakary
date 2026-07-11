// Sends a receipt PDF to a customer via Resend.
// Deploy:  supabase functions deploy send-receipt
// Secrets: supabase secrets set RESEND_API_KEY=... RECEIPT_FROM="Labo Customs <receipts@yourdomain.com>"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RECEIPT_FROM");
  if (!apiKey || !from) {
    return json({ error: "Email not configured" }, 500);
  }

  let payload: {
    to?: string;
    number?: string;
    businessName?: string;
    customerName?: string;
    total?: string;
    pdfUrl?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { to, number, businessName, customerName, total, pdfUrl } = payload;
  if (!(to && pdfUrl)) {
    return json({ error: "Missing 'to' or 'pdfUrl'" }, 400);
  }

  // Fetch the stored PDF and base64-encode it for the attachment.
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) {
    return json({ error: "Could not fetch PDF" }, 502);
  }
  const bytes = new Uint8Array(await pdfRes.arrayBuffer());
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  const base64 = btoa(binary);

  const business = businessName || "Your receipt";
  const label = number || "receipt";
  const firstName = (customerName ?? "").trim().split(/\s+/)[0] || "there";
  const totalLine = total
    ? `<p style="margin:0 0 16px;color:#111827;font-size:15px;line-height:1.6;">Total: <strong>${total}</strong></p>`
    : "";

  const html = `
  <div style="margin:0;padding:32px 0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:32px 36px;">
            <p style="margin:0 0 20px;color:#111827;font-size:18px;font-weight:600;">${business}</p>
            <p style="margin:0 0 16px;color:#111827;font-size:15px;line-height:1.6;">Hi ${firstName},</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
              Thank you for your business. Please find your receipt
              <strong>${label}</strong> attached to this email as a PDF.
            </p>
            ${totalLine}
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              If you have any questions about this receipt, contact us at info@strtunez.com.
            </p>
            <p style="margin:0;color:#111827;font-size:15px;line-height:1.6;">
              Warm regards,<br/>
              <strong>${business}</strong>
            </p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">
          Receipt ${label} · ${business}
        </p>
      </td></tr>
    </table>
  </div>`;

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Your receipt ${label} from ${business}`,
      html,
      attachments: [{ filename: `${label}.pdf`, content: base64 }],
    }),
  });

  if (!emailRes.ok) {
    const detail = await emailRes.text();
    return json({ error: "Resend failed", detail }, 502);
  }

  return json({ ok: true });
});
