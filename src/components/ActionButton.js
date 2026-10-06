import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radii } from '../theme';

export default function ActionButton({
  title,
  onPress,
  icon: Icon,
  variant = 'primary',
  disabled = false,
  style,
  testID,
}) {
  const isPrimary = variant === 'primary';
  const isQuiet = variant === 'quiet';
  const foreground = isPrimary ? colors.white : colors.wineDark;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.78}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        isPrimary && styles.primary,
        isQuiet && styles.quiet,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {Icon ? <Icon color={foreground} size={18} strokeWidth={2.2} /> : null}
      <Text style={[styles.label, { color: foreground }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radii.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primary: { backgroundColor: colors.wine },
  quiet: { backgroundColor: colors.sageLight },
  outline: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  disabled: { opacity: 0.5 },
  label: { fontSize: 15, fontWeight: '700' },
});
