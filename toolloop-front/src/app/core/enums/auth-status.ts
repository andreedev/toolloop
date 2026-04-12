export class AuthStatus {
  // estado que indica si el usuario es un invitado
  public static GUEST = new AuthStatus('GUEST');

  // estado que indica si el usuario está logueado
  public static AUTHENTICATED = new AuthStatus('AUTHENTICATED');

  private readonly name: string;

  private constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public static values() {
    return [
      this.GUEST,
      this.AUTHENTICATED,
    ];
  }

}
