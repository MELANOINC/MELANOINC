export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const response = await fetch("https://melano-inc-three.vercel.app/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": "p1-melanoinc-20260826",
      },
      body: JSON.stringify({
        name: "GREEN GATE MELANO INC 2026-08-26",
        email: "green-gate-melanoinc-20260826@example.com",
        company: "MELANO INC QA",
        message: "Lead controlado P1 melanoinc.online -> LUXIA",
        source_path: "/?utm_source=qa&utm_medium=green-gate&utm_campaign=melanoinc-luxia-p1",
        referrer: "https://melanoinc.online",
        utm_source: "qa",
        utm_medium: "green-gate",
        utm_campaign: "melanoinc-luxia-p1",
        utm_content: "controlled-test",
        utm_term: "p1"
      })
    });

    const body = await response.json().catch(() => null);
    return res.status(response.status).json({ upstream_status: response.status, result: body });
  } catch (error) {
    console.error("P1 smoke failed", error);
    return res.status(500).json({ error: "smoke_failed" });
  }
}
