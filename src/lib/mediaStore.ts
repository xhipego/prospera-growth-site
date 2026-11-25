export type MediaSlotKey =
  | 'heroVideo'
  | 'companyLogo'
  | 'mdPortrait'
  | 'chromeRail1'
  | 'chromeRail2'
  | 'chromeRail3'
  | 'chromeRail4'
  | 'chromeRail5'
  | 'chromeRail6'
  | 'chromeRail7'
  | 'chromeRail8';

export interface MediaAssetState {
  url: string;
  isCustom: boolean;
}

export type MediaMap = Record<MediaSlotKey, MediaAssetState>;

export const DEFAULT_MEDIA_URLS: Record<MediaSlotKey, string> = {
  heroVideo: './assets/media/hero_video.mp4',
  companyLogo: './assets/media/company_logo.png',
  mdPortrait: './assets/media/md_portrait.jpg',
  chromeRail1: './assets/media/rail_1.jpg',
  chromeRail2: './assets/media/rail_2.jpg',
  chromeRail3: './assets/media/rail_3.jpg',
  chromeRail4: './assets/media/rail_4.jpg',
  chromeRail5: './assets/media/rail_5.jpg',
  chromeRail6: './assets/media/rail_6.jpg',
  chromeRail7: './assets/media/rail_7.jpg',
  chromeRail8: './assets/media/rail_8.jpg',
};
