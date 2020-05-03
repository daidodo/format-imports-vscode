/// <directive />

// Global comments

export class GlobalName {}

// Alias is not treated as an import.
// @see https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases
import A = B.C;

export let a: boolean, b: number; // const, var
export const c = 10, d = 'abc';   // let, var

let i = { j: 10, k: 'x' };
export const { j, k: l } = i; // let, var

export function e() { return 2; }
export function* ee() { return 2; }

export type A = string;
export interface B { }
export class B { }

export default c > 10
export default a = false
export default function () { }
export default function m() { }
export default interface C { }
export default class D { }

export * from './hi'  // defualt export is excluded
export * as n from './hi'