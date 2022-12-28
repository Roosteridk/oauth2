export class Oauth2 {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes: string[];
  private state: string;
  private authUrl: string;

  constructor({
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    state,
    authUrl,
  }: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    state?: string;
    authUrl: string;
  }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.scopes = scopes;
    this.authUrl = authUrl;
    this.state = state ?? btoa(crypto.randomUUID());
  }

  public getAuthUrl(params?: Record<string, string>) {
    const auth = new URL(this.authUrl);
    auth.searchParams.append("client_id", this.clientId);
    auth.searchParams.append("redirect_uri", this.redirectUri);
    auth.searchParams.append("response_type", "code");
    auth.searchParams.append("scope", this.scopes.join(" "));
    auth.searchParams.append("state", this.state);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        auth.searchParams.append(key, value);
      }
    }
    return auth.toString();
  }

  public async getToken(code: string) {
    const token = await fetch(this.authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
        grant_type: "authorization_code",
      }),
    });
    return token.json();
  }

  public async refreshToken(refreshToken: string) {
    const token = await fetch(this.authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    return token.json();
  }
}
