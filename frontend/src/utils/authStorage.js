export const AUTH_UPDATED_EVENT = "auth-updated";

export const getStoredToken = () => localStorage.getItem("token");

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (_error) {
    return null;
  }
};

export const getUserRole = (user = getStoredUser()) => {
  if (!user) {
    return null;
  }

  return user.isAdmin ? "admin" : user.role || "customer";
};

export const isOwnerUser = (user = getStoredUser()) =>
  getUserRole(user) === "owner";

export const isAdminUser = (user = getStoredUser()) =>
  getUserRole(user) === "admin";

const dispatchAuthUpdated = () => {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
};

export const setAuthSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  dispatchAuthUpdated();
};

export const updateStoredUser = (user) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }

  dispatchAuthUpdated();
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatchAuthUpdated();
};
