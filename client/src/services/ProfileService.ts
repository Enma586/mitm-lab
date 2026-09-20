import { HttpClient } from "./httpClient";

export interface Profile {
  username: string;
  fullName: string;
  email: string;
}

export interface ProfileService {
  getProfile(token: string): Promise<Profile>;
}

export class HttpProfileService implements ProfileService {
  constructor(private readonly httpClient: HttpClient) {}

  getProfile(token: string): Promise<Profile> {
    return this.httpClient.get<Profile>("/api/profile", token);
  }
}
