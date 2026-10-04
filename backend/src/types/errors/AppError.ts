export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly type: string;

  constructor(message: string) {
    super(message);

    this.type = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  serialize() {
    return {
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
