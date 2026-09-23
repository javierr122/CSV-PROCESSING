/**
 * Clase base para Aggregate Roots del dominio.
 * Simplificada: solo expone el id y sirve como marcador semántico.
 */
export abstract class AggregateRoot<Props> {
  protected readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }
}
