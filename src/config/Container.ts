export class Container {
  private services: Map<string, () => any> = new Map();
  private instances: Map<string, any> = new Map();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  resolve<T>(name: string): T {
    // Return singleton instance if already created
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not registered`);
    }

    const instance = factory();
    this.instances.set(name, instance);
    return instance;
  }

  clear(): void {
    this.services.clear();
    this.instances.clear();
  }
}
