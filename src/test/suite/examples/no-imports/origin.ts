/// <directive />

// Global comments

export class GlobalName {}

// Alias is not treated as an import.
// @see https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
import A = B.C;
