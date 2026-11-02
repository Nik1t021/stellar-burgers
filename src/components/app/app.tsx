import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { fetchIngredients } from '@services/slices/ingredientsSlice';
import { checkAuth } from '@services/slices/userSlice';
import { useDispatch } from '@/services/store';

import { ProtectedRoute } from '../protected-route/protected-route';

import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

type ModalLocationState = { background?: Location };

const App = (): React.JSX.Element => {
  const dispath = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as ModalLocationState | null)?.background;

  useEffect(() => {
    void dispath(fetchIngredients());
    void dispath(checkAuth());
  }, [dispath]);

  const closeModal = (): void => {
    void navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route
        path="/ingredients/:id"
        element={
          <main className={styles.detailPageWrap}>
            <h1 className={clsx(styles.detailHeader, 'text text_type_main-large')}>
              Детали ингредиента
            </h1>
            <IngredientDetails />
          </main>
        } 
      />
      <Route
        path="/feed/:number"
        element={
          <main className={styles.detailPageWrap}>
            <OrderInfo />
          </main>
        }
      />
      <Route element={<ProtectedRoute onlyUnAuth />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 
        </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/orders" element={<ProfileOrders />} />
        <Route
          path="/profile/orders/:number"
          element={
            <main className={styles.detailPageWrap}>
              <OrderInfo />
            </main>
          }
        />
        </Route>
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
          path="/ingredients/:id"
          element={
            <Modal title="Детали ингридиента" onClose={closeModal}>
              <IngredientDetails />
            </Modal>
          }
        />
        <Route
        path="/feed/:number"
        element={
          <Modal title="Детали заказа" onClose={closeModal}>
            <OrderInfo />
          </Modal>
        }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/profile/orders/:number"
            element={
              <Modal title="Детали заказа" onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
          </Route>
        </Routes>
      )}
    </div>
  );
};

export default App;


