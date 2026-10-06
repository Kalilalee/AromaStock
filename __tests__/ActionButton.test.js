import { fireEvent, render } from '@testing-library/react-native';
import ActionButton from '../src/components/ActionButton';

describe('ActionButton', () => {
  test('shows its label', async () => {
    const { getByText } = await render(<ActionButton onPress={() => {}} title="Guardar perfume" />);
    expect(getByText('Guardar perfume')).toBeTruthy();
  });

  test('responds to a press', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<ActionButton onPress={onPress} title="Ingresar" />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
