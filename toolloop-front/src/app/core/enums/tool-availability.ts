export class ToolAvailability {
  public static Siempre = new ToolAvailability('Siempre', 'Siempre disponible');
  public static Lunes_a_Viernes = new ToolAvailability('Lunes_a_Viernes', 'Lunes a viernes');
  public static Fines_de_semana = new ToolAvailability('Fines_de_semana', 'Fines de semana');
  public static No_disponible = new ToolAvailability('No_disponible', 'No disponible');
  public static Personalizado = new ToolAvailability('Personalizado', 'Personalizado');

  private readonly name: string;
  private readonly label: string;

  private constructor(name: string, label: string) {
    this.name = name;
    this.label = label;
  }

  public getName(): string {
    return this.name;
  }

  public getLabel(): string {
    return this.label;
  }

  public isAvailableOnWeekday(weekday: number): boolean {
    switch (this) {
      case ToolAvailability.Siempre:
        return true;
      case ToolAvailability.No_disponible:
        return false;
      case ToolAvailability.Lunes_a_Viernes:
        return weekday >= 0 && weekday <= 4;
      case ToolAvailability.Fines_de_semana:
        return weekday === 5 || weekday === 6;
      case ToolAvailability.Personalizado:
        return true;
      default:
        return false;
    }
  }

  public static values() {
    return [
      this.No_disponible,
      this.Siempre,
      this.Lunes_a_Viernes,
      this.Fines_de_semana,
      this.Personalizado,
    ];
  }

}
