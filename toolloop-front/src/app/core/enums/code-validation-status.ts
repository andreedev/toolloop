export class CodeValidationStatus {
  public static PENDING = new CodeValidationStatus('PENDING');
  public static VALIDATING = new CodeValidationStatus('VALIDATING');
  public static VALID = new CodeValidationStatus('VALID')
  public static INVALID = new CodeValidationStatus('INVALID');

  private readonly name: string;

  private constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public static values() {
    return [
      this.PENDING,
      this.VALIDATING,
      this.VALID,
      this.INVALID,
    ];
  }

}
