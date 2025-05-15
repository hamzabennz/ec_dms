import IAuthRepository from "./IAuthRepository";

class MockAuthRepository extends IAuthRepository {
  constructor() {
    super();
    this.user = null;
    this.token = null;
  }

  async login(username, password) {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: username, password })
      });
      if (!response.ok) {
        return { success: false, message: "Invalid credentials" };
      }
      const data = await response.json();
      this.token = data.accessToken;
      this.user = {
        email: data.email,
        roles: data.roles,
        token: data.accessToken,
        tokenType: data.tokenType
      };
      return { success: true, user: this.user };
    } catch (error) {
      return { success: false, message: "Login failed" };
    }
  }

  logout() {
    this.user = null;
    this.token = null;
  }

  getCurrentUser() {
    return this.user;
  }
}

export default MockAuthRepository;
