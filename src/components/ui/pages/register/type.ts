import type { PageUIProps } from '@ui-pages/common-type';
import type { Dispatch, SetStateAction } from 'react';

export type RegisterUIProps = PageUIProps & {
  password: string;
  isLoading?: boolean;
  userName: string;
  setPassword: Dispatch<SetStateAction<string>>;
  setUserName: Dispatch<SetStateAction<string>>;
};
