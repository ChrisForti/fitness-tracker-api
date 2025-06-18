export class Validator {
  #errors: Record<string, string>;

  constructor() {
    this.#errors = {};
  }

  get valid() {
    return Object.keys(this.#errors).length === 0;
  }

  get errors() {
    return this.#errors;
  }

  addError(key: string, message: string) {
    this.#errors[key] = message;
  }

  check(ok: boolean, key: string, message: string) {
    if (!ok) {
      this.addError(key, message);
    }
  }
}
