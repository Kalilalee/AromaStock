import { INITIAL_PERFUMES, formatPrice, getImageSource } from '../src/data/perfumes';

describe('active perfume catalog', () => {
  test('contains only complete products used by the shop', () => {
    expect(INITIAL_PERFUMES).toHaveLength(6);
    INITIAL_PERFUMES.forEach((perfume) => {
      expect(perfume.storePrice).toEqual(expect.any(Number));
      expect(perfume.family).toEqual(expect.any(String));
      expect(perfume.summary).toEqual(expect.any(String));
      expect(perfume).not.toHaveProperty('notes');
      expect(perfume).not.toHaveProperty('longevity');
      expect(perfume).not.toHaveProperty('sprays');
    });
  });

  test('formats prices and resolves bundled images', () => {
    expect(formatPrice(95000)).toBe('$ 95.000');
    expect(getImageSource(123)).toBe(123);
    expect(getImageSource(null)).toBeNull();
  });
});
