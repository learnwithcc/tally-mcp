export interface Tool<T, U> {
  name: string;
  description: string;
  execute(args: T): Promise<U>;
} 