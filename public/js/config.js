/* CHM Car — runtime config.
   apiBase: leave "" to use the same origin that serves this app (recommended).
   Set to e.g. "https://api.chmcar.com" only if the API lives on a different host. */
window.CHM_CONFIG = {
  apiBase: "",
  // Stripe publishable key is NOT required by this client (Checkout is server-redirect),
  // but kept here for reference / future client-side Elements use.
  stripePublishableKey: ""
};
