const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ success: false, error: "method_not_allowed" }, 405);

    const secret = process.env.HCAPTCHA_SECRET;
    const sitekey = process.env.HCAPTCHA_SITEKEY;
    if (!secret || !sitekey) return json({ success: false, error: "captcha_not_configured" }, 500);

    try {
      const { token } = await request.json();
      if (typeof token !== "string" || token.length === 0 || token.length > 10000) {
        return json({ success: false, error: "invalid_token" }, 400);
      }

      const form = new URLSearchParams({ secret, response: token, sitekey });
      const verifyResponse = await fetch("https://api.hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      if (!verifyResponse.ok) return json({ success: false, error: "captcha_service_error" }, 502);

      const result = await verifyResponse.json();
      if (result.success !== true) {
        return json({ success: false, error: "hcaptcha_rejected", codes: result["error-codes"] || [] }, 403);
      }

      // Optional extra check: set HCAPTCHA_HOSTNAME to your exact deployed hostname.
      const expectedHostname = process.env.HCAPTCHA_HOSTNAME;
      if (expectedHostname && result.hostname !== expectedHostname) {
        return json({ success: false, error: "hostname_mismatch" }, 403);
      }

      return json({ success: true });
    } catch {
      return json({ success: false, error: "invalid_request" }, 400);
    }
  },
};
