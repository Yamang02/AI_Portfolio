const openingAssets = import.meta.glob<string>('../../assets/opening/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

export function getOpeningAssetUrl(filename: string) {
  const path = `../../assets/opening/${filename}`;
  const assetUrl = openingAssets[path];

  if (!assetUrl) {
    throw new Error(`Missing generated opening asset: ${path}`);
  }

  return assetUrl;
}
