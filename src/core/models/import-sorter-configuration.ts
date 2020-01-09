import {
  defaultGeneralConfiguration,
  GeneralConfiguration,
} from './general-configuration';
import {
  defaultImportStringConfiguration,
  ImportStringConfiguration,
} from './import-string-configuration';
import {
  defaultSortConfiguration,
  SortConfiguration,
} from './sort-configuration';

export interface ImportSorterConfiguration {
  sortConfiguration: SortConfiguration;
  importStringConfiguration: ImportStringConfiguration;
  generalConfiguration: GeneralConfiguration;
}

export const defaultImportSorterConfiguration: ImportSorterConfiguration = {
  sortConfiguration: defaultSortConfiguration,
  importStringConfiguration: defaultImportStringConfiguration,
  generalConfiguration: defaultGeneralConfiguration
};
