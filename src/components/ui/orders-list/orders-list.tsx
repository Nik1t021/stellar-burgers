import { OrderCard } from '@components';
import { clsx } from 'clsx';

import type { OrdersListUIProps } from './type';

import styles from './orders-list.module.css';

export const OrdersListUI = ({ orderByDate }: OrdersListUIProps): React.JSX.Element => (
  <div className={clsx(styles.content)}>
    {orderByDate.map((order) => (
      <OrderCard order={order} key={order._id} />
    ))}
  </div>
);
