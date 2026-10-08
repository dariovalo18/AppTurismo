// Error con la forma { codigo, mensaje } que va a devolver la API.
export class ErrorApi extends Error {
  codigo: string;

  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}
