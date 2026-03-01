export type Viewer = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
};

export type AuthMode = "signin" | "signup";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  username: string;
  email: string;
  password: string;
};
