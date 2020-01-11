export type NameBinding =
  | {
      propertyName: string;
      aliasName?: string;
    }
  | {
      aliasName: string;
    };
