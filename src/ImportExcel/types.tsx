import { ProColumns } from '@ant-design/pro-components';
import { ValidationError } from 'class-validator';
import { ImportExcelProps } from '.';

export const validationErrorDeal = <
  T extends {
    errorAtt?: errorItem[];
  },
>(
  errors: ValidationError[][],
) => {
  errors.forEach((error) => {
    if (error.length > 0) {
      error.forEach((item) => {
        const target = item.target as T;
        target.errorAtt ??= [];
        target.errorAtt.push({
          property: item.property,
          message: Object.keys(item.constraints!)
            .map((key) => item.constraints![key])
            .join(';'),
          value: item.value,
        });
      });
    }
  });
};

export type errorItem = { property: string; message: string; value: any };

export interface BaseRecord extends Record<string, any> {
  id: number;
  status: ValidateStatus;
  errorAtt: errorItem[];
}

export const getErrorMessage = <T extends Record<string, any>>(
  errors: errorItem[] | null,
  property: keyof T,
): { hasError: boolean; message: string[] } => {
  if (!errors) return { hasError: false, message: [] };
  const errorAtt = errors.filter(
    (item) => item.property.includes(property as string) || item.property === property,
  );
  return {
    hasError: errorAtt.length > 0,
    message: errorAtt.map((item) => item.message),
  };
};

export enum ValidateStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  WILL = 'will',
}

export const ValidateStatusMapColor: Record<ValidateStatus, string> = {
  // "success", "processing", "error", "default", "warning"
  [ValidateStatus.WILL]: 'default',
  [ValidateStatus.SUCCESS]: 'success',
  [ValidateStatus.ERROR]: 'error',
  [ValidateStatus.WARNING]: 'warning',
};

export const ValidateStatusMapTxt: Record<ValidateStatus, string> = {
  // "success", "processing", "error", "default", "warning"
  [ValidateStatus.WILL]: '未验证',
  [ValidateStatus.SUCCESS]: '验证成功',
  [ValidateStatus.ERROR]: '验证错误',
  [ValidateStatus.WARNING]: '警告',
};

export type ActionProvider<T, R> = {
  dataSource: (T | R)[];
  setDataSource: React.Dispatch<React.SetStateAction<(T | R)[]>>;
  columns: ProColumns<T | R>[];
  setColumns: React.Dispatch<React.SetStateAction<ProColumns<T | R>[]>>;
  props: ImportExcelProps<T, R>;
};
