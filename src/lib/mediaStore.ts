import heroVideoUrl from '../assets/media/hero_video.mp4';
import rail1Url from '../assets/media/rail_1.jpg';
import rail2Url from '../assets/media/rail_2.jpg';
import rail3Url from '../assets/media/rail_3.jpg';
import rail4Url from '../assets/media/rail_4.jpg';
import rail5Url from '../assets/media/rail_5.jpg';
import rail6Url from '../assets/media/rail_6.jpg';
import rail7Url from '../assets/media/rail_7.jpg';
import rail8Url from '../assets/media/rail_8.jpg';

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
  heroVideo: heroVideoUrl,
  companyLogo: './assets/media/company_logo.png',
  mdPortrait: './assets/media/md_portrait.jpg',
  chromeRail1: rail1Url,
  chromeRail2: rail2Url,
  chromeRail3: rail3Url,
  chromeRail4: rail4Url,
  chromeRail5: rail5Url,
  chromeRail6: rail6Url,
  chromeRail7: rail7Url,
  chromeRail8: rail8Url,
};
