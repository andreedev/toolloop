export class RentalStatus {
    public static PENDIENTE = new RentalStatus('Pendiente');
    public static RECHAZADA = new RentalStatus('Rechazada');
    public static APROBADA = new RentalStatus('Aprobada');
    public static EN_USO = new RentalStatus('En_Uso');
    public static COMPLETADA = new RentalStatus('Completada');

    private readonly name: string;

    private constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public static values(): RentalStatus[] {
        return [
            this.PENDIENTE,
            this.RECHAZADA,
            this.APROBADA,
            this.EN_USO,
            this.COMPLETADA
        ];
    }


    public static fromString(status: string): RentalStatus | undefined {
        return this.values().find(s => s.name === status);
    }
}