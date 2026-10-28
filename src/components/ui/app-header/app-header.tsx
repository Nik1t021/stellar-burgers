import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, NavLink, useMatch } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const constructorMatch = useMatch('/');
  const ingredientMatch = useMatch('/ingredients/:id');
  const isConstructor = Boolean(constructorMatch ?? ingredientMatch);
  const isFeed = Boolean(useMatch('/feeed/*'));
  const isProfile = Boolean(useMatch('/profile/*'));

  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')}>
        <div className={styles.menu_part_left}>
          <Link
            to="/"
            className={clsx(styles.link, { [styles.link_active]: isConstructor })}
            aria-current={isConstructor ? 'page' : underfined}
          >
            <BurgerIcon type={isConstructor ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
          </Link>
          <NavLink
          to="/feed"
          className={clsx(styles.link, { [styles.link_active]: isFeed })}
          >
          <ListIcon type={isFeed ? 'primary' : 'secondary'} />
          <p className="text text_type_main-default ml-2">Лента заказов</p>
          </NavLink>
        </div>
        <Link to="/" className={styles.logo} aria-label="На главную">
          <Logo className="" />
        </Link>
        <NavLink
          to="/profile"
          className={clsx(styles.link, styles.link_position_last, {
            [styles.link_active]: isProfile,
          })}
        >
          <ProfileIcon type={isProfile ? 'primary' : 'secondary'} />
          <p className="text text_type_main-default ml-2">
            {userName ?? 'Дичный кабинет'}
          </p>
        </NavLink>
      </nav>
    </header>
  );
};
