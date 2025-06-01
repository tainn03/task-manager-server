export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static isValidString(value: any): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }

  static validateRequired(fields: Record<string, any>): string[] {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === "") {
        errors.push(`${key} is required`);
      }
    }

    return errors;
  }
}
