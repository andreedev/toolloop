export class ReviewType {
  public static RENTER_TO_OWNER = new ReviewType('RENTER_TO_OWNER');
  public static OWNER_TO_RENTER = new ReviewType('OWNER_TO_RENTER');

  private readonly name: string;

  private constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public static values() {
    return [
      this.RENTER_TO_OWNER,
      this.OWNER_TO_RENTER,
    ];
  }

}
