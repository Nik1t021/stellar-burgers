import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectConstructor, selectOrder, selectUser } from '@services/selectors';
import { createOrder, clearOrder } from '@services/slices/orderSlice';
import { useDispatch, useSelector } from '@services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const constructorItems = useSelector(selectConstructor);
  const {
    isLoading: orderRequest,
    order: orderModalData,
    error,
  } = useSelector(selectOrder);
  const { user, isAuthChecked } = useSelector(selectUser);

  const onOrderClick = (): void => {
    if (!isAuthChecked || orderRequest) return;
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    if (!constructorItems.bun) return;
    const ingredients = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((ingredient) => ingredient._id),
      constructorItems.bun._id,
    ];
    void dispatch(createOrder(ingredients));
  };

  const closeOrderModal = (): void => {
    if (!orderRequest) dispatch(clearOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <>
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
      <BurgerConstructorUI
        price={price}
        orderRequest={orderRequest}
        constructorItems={constructorItems}
        orderModalData={orderModalData}
        onOrderClick={onOrderClick}
        closeOrderModal={closeOrderModal}
      />
    </>
  );
};
