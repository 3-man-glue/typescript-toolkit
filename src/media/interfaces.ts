export type VideoConfig = {
  width: number
}

export const videoConverterDictionary = {
  thumbnailWidth: {
    env: 'THUMBNAIL_WIDTH',
    default: 50,
    type: 'number',
  },
}
