export interface IBaseRepository<T> {
  findMany(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: any): Promise<number>;
}

export interface IBaseService<T> {
  findAll(query: any): Promise<{ data: T[]; total: number }>;
  findById(id: string): Promise<T>;
  create(dto: any): Promise<T>;
  update(id: string, dto: any): Promise<T>;
  delete(id: string): Promise<T>;
}
