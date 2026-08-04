// Automatically uses whatever host the browser is currently loaded from,
// so this works on localhost, your hotspot, your home WiFi, or anywhere
// else -- no need to hardcode or update an IP address manually.
const API_BASE = `http://${window.location.hostname}:5000`;

export default API_BASE;