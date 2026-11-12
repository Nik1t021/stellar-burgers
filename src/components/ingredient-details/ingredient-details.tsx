import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsStatus,
} from '@services/selectors/ingredients';
import { useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useSelector(selectIngredients);
  const status = useSelector(selectIngredientsStatus);
  const error = useSelector(selectIngredientsError);
  const ingredientData = ingredients.find((ingredient) => ingredient._id === id);

  if (status === 'idle' || status === 'loading') return <Preloader />;
  if (status === 'failed') return <p role="alert">{error}</p>;
  if (!ingredientData) return <p>Ингредиент не найден</p>;

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
