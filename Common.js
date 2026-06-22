/** Base URL for the Spring Boot API (must match server.port in application.properties). */
const API_BASE = 'http://localhost:8081';

/** Works from top-level folders (UserDashboard, …) and from Admin/* subfolders. */
function loginPageUrl() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/Admin/')) {
        return '../../Login Form/index.html';
    }
    return '../Login Form/index.html';
}

/** Landing page with patient vs caretaker sign-in (project root index.html). */
function landingPageUrl() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/Admin/')) {
        return '../../index.html';
    }
    return '../index.html';
}

function logout() {
    localStorage.removeItem('User');
    window.location.href = landingPageUrl();
}

/**
 * Raw JWT string from login/register response (stored in localStorage as { token: "..." }).
 * Use this for authenticated API calls.
 */
function getAuthToken() {
    const stored = localStorage.getItem('User');
    if (!stored) return null;
    try {
        const parsed = JSON.parse(stored);
        return parsed.token || null;
    } catch (e) {
        return null;
    }
}

/**
 * Headers for JSON requests that require JWT. Spring Security expects:
 * Authorization: Bearer <token>
 */
function authJsonHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

/** For GET (and other) requests that only need the Bearer token, no JSON body. */
function authHeaders() {
    const headers = {};
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

/**
 * Authenticated fetch: merges Authorization onto your options.headers.
 * Use for GET/DELETE or custom methods when you do not need JSON Content-Type.
 */
function authFetch(url, options = {}) {
    const headers = { ...(options.headers || {}), ...authHeaders() };
    return fetch(url, { ...options, headers });
}

/**
 * Authenticated fetch with JSON Content-Type (POST/PUT/PATCH with JSON body).
 */
function authFetchJson(url, options = {}) {
    const headers = { ...authJsonHeaders(), ...(options.headers || {}) };
    return fetch(url, { ...options, headers });
}

function getUserFromToken() {
    const stored = localStorage.getItem("User");
    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored);
        const token = parsed.token; // ← extract the JWT string

        if (!token) return null;

        const parts = token.split(".");
        if (parts.length !== 3) {
            console.error("Not a valid JWT:", token);
            return null;
        }

        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        console.log("Decoded payload:", decoded);

        return {
            id: decoded.id,
            name: decoded.name,
            position: decoded.position,
            email: decoded.sub,
            role: decoded.role || 'OWNER'
        };
    } catch (e) {
        console.error("Token decode failed:", e);
        return null;
    }
}