import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { selectOrderDetail } from '@services/selectors';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@services/selectors/ingredients';
import { fetchOrder } from '@services/slices/feedSlice';
import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);
  const isValidNumber = Number.isInteger(orderNumber) && orderNumber > 0;
  const { order: orderData, error } = useSelector(selectOrderDetail);
  const ingredients = useSelector(selectIngredients);
  const ingredientsStatus = useSelector(selectIngredientsStatus);
  const ingredientsError = useSelector(selectIngredientsError);
  useEffect(() => {
    if (isValidNumber) void dispatch(fetchOrder(orderNumber));
  }, [dispatch, orderNumber, isValidNumber]);
  
  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!isValidNumber) return <p>Некорректный номер заказа</p>;
  if (ingredientsStatus === 'failed') return <p role="alert">{ingredientsError}</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!orderInfo || orderInfo.number !== orderNumber) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
