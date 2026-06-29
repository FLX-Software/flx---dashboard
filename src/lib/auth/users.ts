import "server-only";

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "manager" | "employee";
}

export const LOCAL_USERS: LocalUser[] = [
  {
    id: "fabian-pfeiffer",
    email: "fabian.pfeiffer@flx-software.de",
    password: "Niklas.123",
    full_name: "Fabian Pfeiffer",
    role: "admin",
  },
  {
    id: "fabio-stoeckle",
    email: "fabio.stoeckle@flx-software.de",
    password: "Fabio.123",
    full_name: "Fabio Stöckle",
    role: "admin",
  },
];

export function validateLocalCredentials(
  email: string,
  password: string
): LocalUser | null {
  const user = LOCAL_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user || user.password !== password) return null;
  return user;
}

export function getLocalProfiles() {
  return LOCAL_USERS.map(({ id, email, full_name, role }) => ({
    id,
    email,
    full_name,
    role,
    avatar_url: null,
    created_at: new Date().toISOString(),
  }));
}
