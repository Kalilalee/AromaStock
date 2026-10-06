import { fireEvent, render, userEvent } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import HomeScreen from '../src/screens/HomeScreen';
import { INITIAL_PERFUMES } from '../src/data/perfumes';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///avatar.jpg' }] })),
}));

jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return {
    ArrowLeft: Icon,
    Camera: Icon,
    ChevronRight: Icon,
    Heart: Icon,
    Minus: Icon,
    PackageCheck: Icon,
    PackageSearch: Icon,
    Pencil: Icon,
    ShoppingBag: Icon,
    ShoppingCart: Icon,
    Trash2: Icon,
    UserRound: Icon,
    Check: Icon,
    Plus: Icon,
    X: Icon,
  };
});

describe('HomeScreen shop', () => {
  const onAddToCart = jest.fn();
  const onToggleFavorite = jest.fn();
  const onCreateOrder = jest.fn();
  const onUpdateProfile = jest.fn(async () => ({ ok: true }));
  const props = {
    navigation: { navigate: jest.fn() },
    user: { id: 'user-1', username: 'Kalil', avatarUri: null, favoriteIds: [], orders: [] },
    perfumes: INITIAL_PERFUMES,
    cart: [],
    favoriteIds: [],
    orders: [],
    onAddToCart,
    onSetCartQuantity: jest.fn(),
    onToggleFavorite,
    onCreateOrder,
    onUpdateProfile,
    onLogout: jest.fn(),
  };

  beforeEach(() => {
    onAddToCart.mockClear();
    props.onSetCartQuantity.mockClear();
    onToggleFavorite.mockClear();
    onCreateOrder.mockClear();
    onUpdateProfile.mockClear();
    onUpdateProfile.mockResolvedValue({ ok: true });
  });

  test('shows the shop tabs and all six active catalog perfumes', async () => {
    const { getAllByRole, getByRole, getByText, queryByText } = await render(<HomeScreen {...props} />);

    expect(getAllByRole('tab')).toHaveLength(3);
    expect(getByText('Hawas Fire')).toBeTruthy();
    expect(getByText('Veneno Black')).toBeTruthy();
    expect(getByText('Club de Nuit Iconic')).toBeTruthy();
    expect(getByText('Invictus Victory Elixir')).toBeTruthy();
    expect(getByText('Le Male Le Parfum')).toBeTruthy();
    expect(getByText('Hawas Chrome')).toBeTruthy();

    await userEvent.setup().press(getByRole('tab', { name: 'Perfil' }));
    expect(getByText('Kalil')).toBeTruthy();
    expect(queryByText('Cuenta personal')).toBeNull();
  });

  test('adds a catalog product to the cart', async () => {
    const { getByRole } = await render(<HomeScreen {...props} />);

    fireEvent.press(getByRole('button', { name: 'Agregar Hawas Fire al carrito' }));
    expect(onAddToCart).toHaveBeenCalledWith('hawas-fire');
  });

  test('completes the order, clears the cart and shows the success notice', async () => {
    const { findByRole, findByText, getByRole, getByText, queryByText, rerender } = await render(
      <HomeScreen {...props} cart={[{ perfumeId: 'hawas-fire', quantity: 2 }]} />,
    );
    const user = userEvent.setup();

    await user.press(getByRole('tab', { name: 'Carrito, 2 productos' }));
    await user.press(await findByRole('button', { name: 'Continuar' }));

    expect(getByText('Pedido realizado')).toBeTruthy();
    expect(getByText('2 productos · Total $ 190.000')).toBeTruthy();
    expect(onCreateOrder).toHaveBeenCalledWith(expect.objectContaining({
      count: 2,
      total: 190000,
      items: [expect.objectContaining({ perfumeId: 'hawas-fire', quantity: 2, unitPrice: 95000 })],
    }));
    expect(props.onSetCartQuantity).toHaveBeenCalledWith('hawas-fire', 0);
    expect(getByRole('button', { name: 'Abrir carrito, pedido realizado' })).toBeTruthy();

    rerender(<HomeScreen {...props} cart={[]} />);
    await user.press(getByRole('tab', { name: 'Productos' }));
    expect(queryByText('Pedido realizado')).toBeNull();
    await user.press(getByRole('tab', { name: 'Carrito' }));
    expect(await findByRole('button', { name: 'Abrir carrito, 0 productos' })).toBeTruthy();
    expect(await findByText('Tu carrito está vacío')).toBeTruthy();
    expect(queryByText('Pedido realizado')).toBeNull();
  });

  test('edits the profile name', async () => {
    const { getByText, getByPlaceholderText, getByRole, rerender } = await render(<HomeScreen {...props} />);
    const user = userEvent.setup();

    await user.press(getByRole('tab', { name: 'Perfil' }));
    await user.press(getByText('Editar nombre'));
    fireEvent.changeText(getByPlaceholderText('Tu nombre'), 'Kali');
    await user.press(getByRole('button', { name: 'Guardar nombre' }));

    expect(onUpdateProfile).toHaveBeenCalledWith({ username: 'Kali' });
    await rerender(<HomeScreen {...props} user={{ ...props.user, username: 'Kali' }} />);
    expect(getByText('Kali')).toBeTruthy();
  });

  test('chooses and saves a profile photo', async () => {
    const { getByRole } = await render(<HomeScreen {...props} />);
    const user = userEvent.setup();

    await user.press(getByRole('tab', { name: 'Perfil' }));
    await user.press(getByRole('button', { name: 'Cambiar foto de perfil' }));

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    }));
    expect(onUpdateProfile).toHaveBeenCalledWith({ avatarUri: 'file:///avatar.jpg' });
  });

  test('shows saved favorites and can remove one', async () => {
    const { getByRole, getByText } = await render(
      <HomeScreen {...props} favoriteIds={['hawas-fire']} user={{ ...props.user, favoriteIds: ['hawas-fire'] }} />,
    );
    const user = userEvent.setup();

    await user.press(getByRole('tab', { name: 'Perfil' }));
    await user.press(getByRole('button', { name: 'Favoritos, 1' }));
    expect(getByText('Hawas Fire')).toBeTruthy();
    await user.press(getByRole('button', { name: 'Quitar Hawas Fire de favoritos' }));
    expect(onToggleFavorite).toHaveBeenCalledWith('hawas-fire');
  });

  test('lists locally recorded orders', async () => {
    const order = {
      id: 'order-1',
      createdAt: '2026-10-04T12:00:00.000Z',
      total: 95000,
      items: [{ perfumeId: 'hawas-fire', name: 'Hawas Fire', quantity: 1, unitPrice: 95000 }],
    };
    const { getAllByText, getByRole, getByText } = await render(
      <HomeScreen {...props} orders={[order]} user={{ ...props.user, orders: [order] }} />,
    );
    const user = userEvent.setup();

    await user.press(getByRole('tab', { name: 'Perfil' }));
    await user.press(getByRole('button', { name: 'Mis pedidos, 1' }));
    expect(getByText('Pedido realizado')).toBeTruthy();
    expect(getByText('1 x Hawas Fire')).toBeTruthy();
    expect(getAllByText('$ 95.000')).toHaveLength(2);
  });
});
