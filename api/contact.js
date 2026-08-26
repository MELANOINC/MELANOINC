const LUXIA_WEB_LEAD_URL = "https://orehvausvxxtvjomxchr.supabase.co/functions/v1/melanoinc-web-lead";

function text(value, max = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = req.body || {};
  const name = text(body.name, 200);
  const email = text(body.email, 320).toLowerCase();
  const phone = text(body.phone || body.whatsapp || body.telefono, 80);
  const company = text(body.company, 200);
  const message = text(body.message || body.intent || body.intencion, 1000);

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: "name_and_contact_required" });
  }

  try {
    const response = await fetch(LUXIA_WEB_LEAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://melanoinc.com",
        "X-Idempotency-Key": text(req.headers["x-idempotency-key"], 200) || `web-${Date.now()}`,
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        company,
        message,
        website: text(body.website, 200),
        source_path: text(body.source_path, 500),
        referrer: text(body.referrer, 500),
        utm_source: text(body.utm_source, 100),
        utm_medium: text(body.utm_medium, 100),
        utm_campaign: text(body.utm_campaign, 200),
        utm_content: text(body.utm_content, 200),
        utm_term: text(body.utm_term, 200),
      }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("LUXIA lead capture failed", response.status, result);
      return res.status(502).json({ error: "lead_capture_failed" });
    }

    return res.status(response.status === 201 ? 201 : 200).json({
      success: true,
      lead_id: result?.lead_id || null,
      deduped: Boolean(result?.deduped),
    });
  } catch (error) {
    console.error("Contact proxy exception", error);
    return res.status(500).json({ error: "lead_capture_unavailable" });
  }
}
