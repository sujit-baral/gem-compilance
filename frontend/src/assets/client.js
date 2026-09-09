/**
 * Central API client — every component calls the backend through these functions.
 * Change BASE_URL here if your backend ever runs on a different port.
 */
const BASE_URL = "http://127.0.0.1:8000";

export async function createTender(data) {
  const res = await fetch(`${BASE_URL}/tenders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getTender(tenderId) {
  const res = await fetch(`${BASE_URL}/tenders/${tenderId}`);
  return res.json();
}

export async function createBidder(data) {
  const res = await fetch(`${BASE_URL}/bidders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createApplication(data) {
  const res = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function uploadDocument(formData) {
  const res = await fetch(`${BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData, // FormData — do NOT set Content-Type manually, browser sets it
  });
  return res.json();
}

export async function getDashboard(applicationId) {
  const res = await fetch(`${BASE_URL}/dashboard/${applicationId}`);
  return res.json();
}

export async function submitDecision(applicationId, data) {
  const res = await fetch(`${BASE_URL}/dashboard/${applicationId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function listTenders() {
  const res = await fetch(`${BASE_URL}/tenders`);
  return res.json();
}

export async function listApplications() {
  const res = await fetch(`${BASE_URL}/applications`);
  return res.json();
}

export async function getApplicationDocuments(applicationId) {
  const res = await fetch(`${BASE_URL}/documents/application/${applicationId}`);
  return res.json();
}

/**
 * Bidder login lookup — finds an already-registered bidder by PAN or
 * Bidder ID so they can log back in without re-registering.
 *
 * NOTE FOR BACKEND: this endpoint (GET /bidders/lookup/{query}) does
 * not exist yet in Main.py. It needs to search the bidders table/JSON
 * for a row where pan_number == query OR bidder_id == query, and
 * return that bidder record (same shape as createBidder's response),
 * or a 404 if nothing matches. Until that route exists, this call
 * will fail — the login page handles that failure gracefully and
 * shows an explanatory error instead of crashing.
 */
export async function findBidder(query) {
  const res = await fetch(`${BASE_URL}/bidders/lookup/${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Bidder not found — check your PAN or Bidder ID, or register instead.");
  }
  return res.json();
}
