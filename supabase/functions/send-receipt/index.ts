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
    pdfUrl?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { to, number, businessName, pdfUrl } = payload;
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

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `${business} — Receipt ${label}`,
      html: `<p>Hi,</p><p>Please find your receipt <strong>${label}</strong> from ${business} attached.</p><p>Thank you!</p>`,
      attachments: [{ filename: `${label}.pdf`, content: base64 }],
    }),
  });

  if (!emailRes.ok) {
    const detail = await emailRes.text();
    return json({ error: "Resend failed", detail }, 502);
  }

  return json({ ok: true });
});
