import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii } from '../theme';

export default function TextField({ label, style, inputStyle, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="sentences"
        placeholderTextColor={colors.muted}
        selectionColor={colors.wine}
        style={[styles.input, inputProps.multiline && styles.multiline, inputStyle]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 15,
  },
  multiline: { minHeight: 82, paddingTop: 12, textAlignVertical: 'top' },
});
