export class ToolCondition {
  public static Nuevo = new ToolCondition('Nuevo');
  public static Excelente = new ToolCondition('Excelente');
  public static Muy_bueno = new ToolCondition('Muy_bueno');
  public static Bueno = new ToolCondition('Bueno');
  public static Aceptable = new ToolCondition('Aceptable');

  private readonly name: string;

  private constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public getLabel(): string {
    return this.name.replace(/_/g, ' ');
  }

  public static values() {
    return [
      this.Nuevo,
      this.Excelente,
      this.Muy_bueno,
      this.Bueno,
      this.Aceptable,
    ];
  }

}
