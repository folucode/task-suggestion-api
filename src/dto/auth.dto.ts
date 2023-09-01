export interface SignInDto {
  username: string;
  password: string;
}

export interface SignUpDto {
  username: string;
  email: string;
  fullName: string;
  timezone: string;
  password: string;
}
