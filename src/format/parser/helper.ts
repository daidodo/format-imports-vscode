import { Identifier } from 'typescript';

import { NameBinding } from '../types';

export function getNameBinding(specifier: {
  propertyName?: Identifier;
  name: Identifier;
}): NameBinding {
  const { text: name } = specifier.name;
  const prop = specifier.propertyName?.text;
  return prop && prop !== name ? { aliasName: name, propertyName: prop } : { propertyName: name };
}
