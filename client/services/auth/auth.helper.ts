// Auth cookies are HttpOnly and therefore cannot be read or exfiltrated by
// client-side JavaScript. The API clears them on logout.
export const removeFromStorage = () => undefined
