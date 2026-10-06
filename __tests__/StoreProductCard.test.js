import { fireEvent, render } from '@testing-library/react-native';
import StoreProductCard from '../src/components/StoreProductCard';

jest.mock('lucide-react-native', () => ({
  Check: () => null,
  Heart: () => null,
  Plus: () => null,
}));

const perfume = {
  id: 'hawas-fire',
  name: 'Hawas Fire',
  brand: 'Rasasi',
  image: null,
  presentation: 'Eau de Parfum · 100 ml',
  volume: '100 ML',
  storePrice: 95000,
};

describe('StoreProductCard', () => {
  test('shows its price and bottle volume', async () => {
    const { getByText } = await render(
      <StoreProductCard perfume={perfume} cartQuantity={0} onPress={() => {}} onAddToCart={() => {}} />,
    );

    expect(getByText('$ 95.000')).toBeTruthy();
    expect(getByText('100 ML')).toBeTruthy();
  });

  test('shows a volume other than 100 ml', async () => {
    const { getByText } = await render(
      <StoreProductCard perfume={{ ...perfume, volume: '105 ML' }} cartQuantity={0} onPress={() => {}} onAddToCart={() => {}} />,
    );

    expect(getByText('105 ML')).toBeTruthy();
  });

  test('adds the perfume to the cart', async () => {
    const onAddToCart = jest.fn();
    const { getByRole } = await render(
      <StoreProductCard perfume={perfume} cartQuantity={0} onPress={() => {}} onAddToCart={onAddToCart} />,
    );

    fireEvent.press(getByRole('button', { name: 'Agregar Hawas Fire al carrito' }));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });

  test('toggles the favorite state accessibly', async () => {
    const onToggleFavorite = jest.fn();
    const { getByRole } = await render(
      <StoreProductCard perfume={perfume} cartQuantity={0} onPress={() => {}} onAddToCart={() => {}} onToggleFavorite={onToggleFavorite} />,
    );

    fireEvent.press(getByRole('button', { name: 'Agregar Hawas Fire a favoritos' }));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  test('marks a saved favorite as selected', async () => {
    const { getByRole } = await render(
      <StoreProductCard perfume={perfume} cartQuantity={0} favorite onPress={() => {}} onAddToCart={() => {}} onToggleFavorite={() => {}} />,
    );

    expect(getByRole('button', { name: 'Quitar Hawas Fire de favoritos' }).props.accessibilityState).toEqual({ selected: true });
  });
});
