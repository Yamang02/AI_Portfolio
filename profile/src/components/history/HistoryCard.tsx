import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { ProfileHistoryIcon, ProfileHistoryMedia } from '../../content/types';
import { useInView } from '../../hooks/useInView';
import { historyAssets } from './historyAssets';

export type HistoryCardSide = 'left' | 'right';

interface HistoryCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly start: string;
  readonly end?: string;
  readonly href?: string;
  readonly media: ProfileHistoryMedia;
  readonly side: HistoryCardSide;
  readonly isActive: boolean;
  readonly presentLabel: string;
  readonly linkSuffix: string;
}

interface ResponsivePosterProps {
  readonly avif400: string;
  readonly webp400: string;
  readonly avif800: string;
  readonly webp800: string;
  readonly sizes: string;
  readonly focus?: string;
}

interface HistoryMediaProps {
  readonly media: ProfileHistoryMedia;
  readonly isActive: boolean;
  readonly hasLink: boolean;
}

interface HistoryPeriodProps {
  readonly start: string;
  readonly end?: string;
  readonly presentLabel: string;
}

const MEDIA_SIZES = '(min-width: 1024px) clamp(240px, 22vw, 340px), min(560px, calc(100vw - 5rem))';
const HOVER_SCALE = 'transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]';

interface KeywordIconPath {
  readonly d: string;
  readonly fill?: 'none' | 'currentColor';
  readonly fillRule?: 'evenodd';
  readonly clipRule?: 'evenodd';
  readonly stroke?: 'currentColor';
  readonly strokeWidth?: number;
  readonly strokeLinecap?: 'butt' | 'round';
  readonly strokeLinejoin?: 'round';
}

const KEYWORD_ICON_PATHS: Record<ProfileHistoryIcon, readonly KeywordIconPath[]> = {
  book: [
    { d: 'M22 16.7399V4.66994C22 3.46994 21.02 2.57994 19.83 2.67994H19.77C17.67 2.85994 14.48 3.92994 12.7 5.04994L12.53 5.15994C12.24 5.33994 11.76 5.33994 11.47 5.15994L11.22 5.00994C9.44 3.89994 6.26 2.83994 4.16 2.66994C2.97 2.56994 2 3.46994 2 4.65994V16.7399C2 17.6999 2.78 18.5999 3.74 18.7199L4.03 18.7599C6.2 19.0499 9.55 20.1499 11.47 21.1999L11.51 21.2199C11.78 21.3699 12.21 21.3699 12.47 21.2199C14.39 20.1599 17.75 19.0499 19.93 18.7599L20.26 18.7199C21.22 18.5999 22 17.6999 22 16.7399Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    { d: 'M12 5.48999V20.49', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'butt', strokeLinejoin: 'round' },
    { d: 'M7.75 8.48999H5.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    { d: 'M8.5 11.49H5.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
  ],
  briefcase: [
    { d: 'M13.6289 1.25H10.3711C9.97574 1.24999 9.63465 1.24998 9.35373 1.27293C9.05722 1.29715 8.76231 1.35064 8.47852 1.49524C8.05516 1.71095 7.71095 2.05516 7.49524 2.47852C7.35064 2.76231 7.29715 3.05722 7.27293 3.35373C7.25235 3.60556 7.25023 3.90573 7.25002 4.25H5.96858C5.2952 4.24999 4.74449 4.24999 4.29693 4.28655C3.83367 4.3244 3.41527 4.40514 3.02453 4.60423C2.41301 4.91582 1.91582 5.413 1.60423 6.02453C1.40514 6.41527 1.3244 6.83367 1.28655 7.29693C1.24999 7.74449 1.24999 8.29519 1.25 8.96856V11.1913C1.24999 11.8368 1.24998 12.3665 1.28519 12.7974C1.32168 13.244 1.39969 13.65 1.59333 14.0301C1.64114 14.1239 1.69345 14.215 1.75 14.3029L1.75 16.8324C1.74999 17.715 1.74999 18.4231 1.79677 18.9956C1.84484 19.584 1.94601 20.095 2.18597 20.5659C2.56947 21.3186 3.18139 21.9305 3.93404 22.314C4.405 22.554 4.91601 22.6551 5.50433 22.7032C6.07691 22.75 6.78499 22.75 7.66761 22.75H16.3324C17.215 22.75 17.9231 22.75 18.4957 22.7032C19.084 22.6551 19.595 22.554 20.066 22.314C20.8186 21.9305 21.4305 21.3186 21.814 20.5659C22.054 20.095 22.1552 19.584 22.2032 18.9956C22.25 18.4231 22.25 17.715 22.25 16.8324V14.303C22.3065 14.215 22.3589 14.1239 22.4067 14.0301C22.6003 13.65 22.6783 13.244 22.7148 12.7974C22.75 12.3665 22.75 11.8368 22.75 11.1913V8.96856C22.75 8.29519 22.75 7.74449 22.7134 7.29693C22.6756 6.83367 22.5949 6.41527 22.3958 6.02453C22.0842 5.41301 21.587 4.91582 20.9755 4.60423C20.5847 4.40514 20.1663 4.3244 19.7031 4.28655C19.2555 4.24998 18.7048 4.24999 18.0314 4.25H16.75C16.7498 3.90573 16.7476 3.60556 16.7271 3.35373C16.7028 3.05722 16.6494 2.76231 16.5048 2.47852C16.2891 2.05516 15.9448 1.71095 15.5215 1.49524C15.2377 1.35064 14.9428 1.29715 14.6463 1.27293C14.3653 1.24998 14.0243 1.24999 13.6289 1.25ZM15.9988 5.75C15.9992 5.75 15.9996 5.75 16 5.75C16.0004 5.75 16.0008 5.75 16.0012 5.75H18C18.7124 5.75 19.2017 5.75058 19.5809 5.78157C19.9514 5.81184 20.1504 5.86735 20.2945 5.94074C20.6238 6.10852 20.8915 6.37623 21.0593 6.70552C21.1327 6.84956 21.1882 7.04858 21.2184 7.41908C21.2494 7.79833 21.25 8.28756 21.25 9V11.16C21.25 11.8444 21.2494 12.3127 21.2198 12.6752C21.1909 13.0291 21.1381 13.2157 21.0702 13.3491C20.912 13.6596 20.6596 13.912 20.3491 14.0702C20.2157 14.1381 20.0291 14.1909 19.6752 14.2198C19.3127 14.2494 18.8444 14.25 18.16 14.25H14.25C14.25 13.0074 13.2426 12 12 12C10.7574 12 9.75 13.0074 9.75 14.25L5.84 14.25C5.15556 14.25 4.68734 14.2494 4.32476 14.2198C3.97093 14.1909 3.78426 14.1381 3.65092 14.0702C3.34045 13.912 3.08803 13.6596 2.92984 13.3491C2.8619 13.2157 2.80912 13.0291 2.78021 12.6752C2.75058 12.3127 2.75 11.8444 2.75 11.16L2.75 9C2.75 8.28756 2.75058 7.79834 2.78157 7.41908C2.81184 7.04858 2.86735 6.84956 2.94074 6.70552C3.10852 6.37624 3.37623 6.10852 3.70552 5.94074C3.84956 5.86735 4.04858 5.81184 4.41908 5.78157C4.79834 5.75059 5.28756 5.75 6 5.75H7.99879C7.9992 5.75 7.9996 5.75 8 5.75C8.0004 5.75 8.00081 5.75 8.00121 5.75H15.9988ZM15.2499 4.25C15.2496 3.90117 15.2473 3.66274 15.2321 3.47588C15.2154 3.27213 15.1872 3.19659 15.1683 3.15951C15.0964 3.01839 14.9816 2.90365 14.8405 2.83175C14.8034 2.81285 14.7279 2.78459 14.5241 2.76795C14.3116 2.75059 14.0324 2.75 13.6 2.75H10.4C9.96759 2.75 9.68838 2.75059 9.47588 2.76795C9.27213 2.78459 9.19659 2.81285 9.15951 2.83175C9.01839 2.90365 8.90365 3.01839 8.83175 3.15951C8.81285 3.19659 8.78459 3.27213 8.76795 3.47588C8.75268 3.66274 8.75039 3.90117 8.75006 4.25L15.2499 4.25ZM3.25 16.8V15.5278C3.54844 15.6356 3.86387 15.6871 4.20261 15.7148C4.63351 15.75 5.16326 15.75 5.80878 15.75L9.75 15.75C9.75 16.9926 10.7574 18 12 18C13.2426 18 14.25 16.9926 14.25 15.75H18.1913C18.8368 15.75 19.3665 15.75 19.7974 15.7148C20.1361 15.6871 20.4516 15.6356 20.75 15.5278V16.8C20.75 17.7224 20.7494 18.3692 20.7082 18.8735C20.6677 19.3691 20.5918 19.6607 20.4775 19.8849C20.2378 20.3554 19.8554 20.7378 19.385 20.9775C19.1607 21.0918 18.8691 21.1677 18.3735 21.2082C17.8692 21.2494 17.2225 21.25 16.3 21.25H7.7C6.77754 21.25 6.1308 21.2494 5.62648 21.2082C5.13092 21.1677 4.83928 21.0918 4.61502 20.9775C4.14462 20.7378 3.76217 20.3554 3.52248 19.8849C3.40822 19.6607 3.33228 19.3691 3.29179 18.8735C3.25058 18.3692 3.25 17.7224 3.25 16.8ZM12 16.5C11.5858 16.5 11.25 16.1642 11.25 15.75V14.25C11.25 13.8358 11.5858 13.5 12 13.5C12.4142 13.5 12.75 13.8358 12.75 14.25V14.99L12.75 14.995L12.75 15V15.75C12.75 16.1642 12.4142 16.5 12 16.5Z', fill: 'currentColor', fillRule: 'evenodd', clipRule: 'evenodd' },
  ],
  code: [
    { d: 'M14.1809 4.2755C14.581 4.3827 14.8185 4.79396 14.7113 5.19406L10.7377 20.0238C10.6304 20.4239 10.2192 20.6613 9.81909 20.5541C9.41899 20.4469 9.18156 20.0356 9.28876 19.6355L13.2624 4.80583C13.3696 4.40573 13.7808 4.16829 14.1809 4.2755Z', fill: 'currentColor' },
    { d: 'M16.4425 7.32781C16.7196 7.01993 17.1938 6.99497 17.5017 7.27206L19.2392 8.8358C19.9756 9.49847 20.5864 10.0482 21.0058 10.5467C21.4468 11.071 21.7603 11.6342 21.7603 12.3295C21.7603 13.0248 21.4468 13.5881 21.0058 14.1123C20.5864 14.6109 19.9756 15.1606 19.2392 15.8233L17.5017 17.387C17.1938 17.6641 16.7196 17.6391 16.4425 17.3313C16.1654 17.0234 16.1904 16.5492 16.4983 16.2721L18.1947 14.7452C18.9826 14.0362 19.5138 13.5558 19.8579 13.1467C20.1882 12.7541 20.2603 12.525 20.2603 12.3295C20.2603 12.1341 20.1882 11.9049 19.8579 11.5123C19.5138 11.1033 18.9826 10.6229 18.1947 9.91383L16.4983 8.387C16.1904 8.10991 16.1654 7.63569 16.4425 7.32781Z', fill: 'currentColor' },
    { d: 'M7.50178 8.387C7.80966 8.10991 7.83462 7.63569 7.55752 7.32781C7.28043 7.01993 6.80621 6.99497 6.49833 7.27206L4.76084 8.8358C4.0245 9.49847 3.41369 10.0482 2.99428 10.5467C2.55325 11.071 2.23975 11.6342 2.23975 12.3295C2.23975 13.0248 2.55325 13.5881 2.99428 14.1123C3.41369 14.6109 4.02449 15.1606 4.76082 15.8232L6.49833 17.387C6.80621 17.6641 7.28043 17.6391 7.55752 17.3313C7.83462 17.0234 7.80966 16.5492 7.50178 16.2721L5.80531 14.7452C5.01743 14.0362 4.48623 13.5558 4.14213 13.1467C3.81188 12.7541 3.73975 12.525 3.73975 12.3295C3.73975 12.1341 3.81188 11.9049 4.14213 11.5123C4.48623 11.1033 5.01743 10.6229 5.80531 9.91383L7.50178 8.387Z', fill: 'currentColor' },
  ],
  erp: [
    { d: 'M8.46778 1.25H15.5322C15.972 1.24998 16.3514 1.24997 16.6627 1.27818C16.9918 1.30802 17.3178 1.37407 17.625 1.55144C17.967 1.74892 18.2511 2.03296 18.4486 2.375C18.6259 2.68221 18.692 3.00817 18.7218 3.33735C18.7333 3.46384 18.7401 3.60156 18.7441 3.75L19.069 3.75C19.4934 3.74999 19.8477 3.74999 20.1388 3.76897C20.4418 3.78872 20.7283 3.83128 21.0074 3.94117C21.7174 4.22069 22.2793 4.78261 22.5588 5.49258C22.6687 5.77171 22.7113 6.05823 22.731 6.3612C22.75 6.65235 22.75 7.00665 22.75 7.43105V7.4551C22.75 7.4958 22.75 7.53596 22.7501 7.57559C22.7506 8.23353 22.7511 8.74599 22.593 9.19346C22.3636 9.84304 21.8987 10.3829 21.2904 10.7061C20.8713 10.9288 20.3644 11.0044 19.7137 11.1014C19.6745 11.1073 19.6348 11.1132 19.5945 11.1192L15.5179 11.7307C14.6861 11.8555 14.1318 11.94 13.7209 12.0556C13.3303 12.1654 13.1623 12.2796 13.0528 12.4067C12.9236 12.5567 12.8363 12.7669 12.7902 13.2599C12.9356 13.2662 13.072 13.2765 13.1972 13.2933C13.5527 13.3411 13.9284 13.4535 14.2374 13.7626C14.5465 14.0716 14.6589 14.4473 14.7067 14.8028C14.7501 15.1256 14.7501 15.5224 14.75 15.9553V20.0447C14.7501 20.4776 14.7501 20.8744 14.7067 21.1972C14.6589 21.5527 14.5465 21.9284 14.2374 22.2374C13.9284 22.5465 13.5527 22.6589 13.1972 22.7067C12.8744 22.7501 12.4776 22.7501 12.0447 22.75H11.9553C11.5224 22.7501 11.1256 22.7501 10.8028 22.7067C10.4473 22.6589 10.0716 22.5465 9.76256 22.2374C9.45354 21.9284 9.34109 21.5527 9.2933 21.1972C9.2499 20.8744 9.24995 20.4776 9.25 20.0448V15.9553C9.24995 15.5224 9.2499 15.1256 9.2933 14.8028C9.34109 14.4473 9.45354 14.0716 9.76256 13.7626C10.0716 13.4535 10.4473 13.3411 10.8028 13.2933C10.949 13.2736 11.1105 13.2629 11.2836 13.257C11.3358 12.5533 11.4805 11.9337 11.9162 11.4278C12.2913 10.9923 12.7718 10.7643 13.3149 10.6116C13.8273 10.4675 14.4759 10.3702 15.2486 10.2543L19.372 9.63581C20.2001 9.5116 20.4254 9.46711 20.5865 9.38148C20.8631 9.23455 21.0744 8.98918 21.1786 8.69392C21.2394 8.52185 21.25 8.29243 21.25 7.4551C21.25 7.00044 21.2496 6.6953 21.2342 6.45878C21.2192 6.22858 21.1922 6.11609 21.1631 6.04208C21.0361 5.71937 20.7806 5.46395 20.4579 5.3369C20.3839 5.30776 20.2714 5.2808 20.0412 5.26579C19.8047 5.25037 19.4996 5.25 19.0449 5.25H18.7441C18.7401 5.39845 18.7333 5.53617 18.7218 5.66265C18.692 5.99183 18.6259 6.31779 18.4486 6.625C18.2511 6.96704 17.967 7.25108 17.625 7.44856C17.3178 7.62593 16.9918 7.69198 16.6627 7.72182C16.3514 7.75003 15.972 7.75002 15.5322 7.75H8.46777C8.02799 7.75002 7.64864 7.75003 7.33735 7.72182C7.00817 7.69198 6.68221 7.62593 6.375 7.44856C6.03296 7.25108 5.74892 6.96704 5.55144 6.625C5.37407 6.31779 5.30802 5.99183 5.27818 5.66265C5.26567 5.5246 5.25871 5.37317 5.25484 5.20902C4.96102 5.10744 4.75 4.82836 4.75 4.5C4.75 4.17164 4.96102 3.89257 5.25484 3.79099C5.25871 3.62683 5.26567 3.4754 5.27818 3.33735C5.30802 3.00817 5.37407 2.68221 5.55144 2.375C5.74892 2.03296 6.03296 1.74892 6.375 1.55144C6.68221 1.37407 7.00817 1.30802 7.33735 1.27818C7.64864 1.24997 8.02799 1.24998 8.46778 1.25ZM12.0047 14.75C12.0031 14.75 12.0016 14.75 12 14.75C11.5074 14.75 11.2134 14.7516 11.0027 14.7799C10.9061 14.7929 10.8577 14.8082 10.836 14.8172C10.8309 14.8192 10.8276 14.8209 10.8257 14.8219L10.8232 14.8232L10.8219 14.8257C10.8209 14.8276 10.8192 14.8309 10.8172 14.836C10.8082 14.8577 10.7929 14.9061 10.7799 15.0027C10.7516 15.2134 10.75 15.5074 10.75 16V20C10.75 20.4926 10.7516 20.7866 10.7799 20.9973C10.7929 21.0939 10.8082 21.1423 10.8172 21.164C10.8192 21.1691 10.8209 21.1724 10.8219 21.1743L10.8232 21.1768L10.8257 21.1781C10.8276 21.1792 10.8309 21.1808 10.836 21.1828C10.8577 21.1918 10.9061 21.2071 11.0027 21.2201C11.2134 21.2484 11.5074 21.25 12 21.25C12.4926 21.25 12.7866 21.2484 12.9973 21.2201C13.0939 21.2071 13.1423 21.1918 13.164 21.1828C13.1676 21.1814 13.1703 21.1801 13.1723 21.1792C13.1731 21.1788 13.1738 21.1784 13.1743 21.1781L13.1768 21.1768L13.1781 21.1743C13.1791 21.1724 13.1808 21.1691 13.1828 21.164C13.1918 21.1423 13.2071 21.0939 13.2201 20.9973C13.2484 20.7866 13.25 20.4926 13.25 20V16C13.25 15.5074 13.2484 15.2134 13.2201 15.0027C13.2071 14.9061 13.1918 14.8577 13.1828 14.836C13.1808 14.8309 13.1791 14.8276 13.1781 14.8257L13.1768 14.8232L13.1743 14.8219C13.1731 14.8212 13.1712 14.8203 13.1687 14.8191C13.1673 14.8185 13.1658 14.8179 13.164 14.8172C13.1423 14.8082 13.0939 14.7929 12.9973 14.7799C12.7873 14.7517 12.4945 14.75 12.0047 14.75ZM7.47275 2.77206C7.2476 2.79247 7.16586 2.82689 7.125 2.85048C7.01099 2.91631 6.91631 3.01099 6.85048 3.125C6.82689 3.16586 6.79246 3.2476 6.77206 3.47275C6.75072 3.7082 6.75 4.01889 6.75 4.5C6.75 4.98111 6.75072 5.2918 6.77206 5.52726C6.79246 5.7524 6.82689 5.83414 6.85048 5.875C6.91631 5.98902 7.01099 6.08369 7.125 6.14952C7.16586 6.17311 7.2476 6.20754 7.47275 6.22794C7.7082 6.24928 8.01889 6.25 8.5 6.25H15.5C15.9811 6.25 16.2918 6.24928 16.5273 6.22794C16.7524 6.20754 16.8341 6.17311 16.875 6.14952C16.989 6.08369 17.0837 5.98902 17.1495 5.875C17.1731 5.83414 17.2075 5.7524 17.2279 5.52726C17.2493 5.2918 17.25 4.98111 17.25 4.5C17.25 4.01889 17.2493 3.7082 17.2279 3.47275C17.2075 3.2476 17.1731 3.16587 17.1495 3.125C17.0837 3.01099 16.989 2.91631 16.875 2.85048C16.8341 2.82689 16.7524 2.79247 16.5273 2.77206C16.2918 2.75072 15.9811 2.75 15.5 2.75H8.5C8.01889 2.75 7.7082 2.75072 7.47275 2.77206ZM10.8232 14.8232C10.8236 14.823 10.8236 14.8228 10.8232 14.8232C10.8228 14.8237 10.823 14.8236 10.8232 14.8232Z', fill: 'currentColor', fillRule: 'evenodd', clipRule: 'evenodd' },
  ],
  database: [
    { d: 'M3.25 6C3.25 4.45831 4.48029 3.26447 6.00774 2.50075C7.58004 1.7146 9.69967 1.25 12 1.25C14.3003 1.25 16.42 1.7146 17.9923 2.50075C19.5197 3.26447 20.75 4.45831 20.75 6V18C20.75 19.5417 19.5197 20.7355 17.9923 21.4992C16.42 22.2854 14.3003 22.75 12 22.75C9.69967 22.75 7.58004 22.2854 6.00774 21.4992C4.48029 20.7355 3.25 19.5417 3.25 18V6ZM4.75 6C4.75 5.33255 5.31057 4.52639 6.67856 3.84239C8.00168 3.18083 9.88205 2.75 12 2.75C14.118 2.75 15.9983 3.18083 17.3214 3.84239C18.6894 4.52639 19.25 5.33255 19.25 6C19.25 6.66745 18.6894 7.47361 17.3214 8.15761C15.9983 8.81917 14.118 9.25 12 9.25C9.88205 9.25 8.00168 8.81917 6.67856 8.15761C5.31057 7.47361 4.75 6.66745 4.75 6ZM4.75 18C4.75 18.6674 5.31057 19.4736 6.67856 20.1576C8.00168 20.8192 9.88205 21.25 12 21.25C14.118 21.25 15.9983 20.8192 17.3214 20.1576C18.6894 19.4736 19.25 18.6674 19.25 18V14.7072C18.8733 15.0077 18.4459 15.2724 17.9923 15.4992C16.42 16.2854 14.3003 16.75 12 16.75C9.69967 16.75 7.58004 16.2854 6.00774 15.4992C5.55414 15.2724 5.12675 15.0077 4.75 14.7072V18ZM19.25 8.70722V12C19.25 12.6674 18.6894 13.4736 17.3214 14.1576C15.9983 14.8192 14.118 15.25 12 15.25C9.88205 15.25 8.00168 14.8192 6.67856 14.1576C5.31057 13.4736 4.75 12.6674 4.75 12V8.70722C5.12675 9.00772 5.55414 9.27245 6.00774 9.49925C7.58004 10.2854 9.69967 10.75 12 10.75C14.3003 10.75 16.42 10.2854 17.9923 9.49925C18.4459 9.27245 18.8733 9.00772 19.25 8.70722Z', fill: 'currentColor', fillRule: 'evenodd', clipRule: 'evenodd' },
  ],
};

function KeywordMedia({ icon, text }: { readonly icon: ProfileHistoryIcon; readonly text: string }) {
  const paths = KEYWORD_ICON_PATHS[icon];

  return (
    <div className={'relative size-full bg-surface-container-low ' + HOVER_SCALE}>
      <svg
        aria-hidden="true"
        className="absolute -right-[4cqw] -top-[4cqw] size-[44cqw] text-on-surface-variant/15"
        focusable="false"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map(({ d, ...attributes }) => (
          <path d={d} key={d} {...attributes} />
        ))}
      </svg>
      <span className="absolute left-[7cqw] top-[7cqw] whitespace-nowrap xl:bottom-[7cqw] xl:top-auto font-headline text-[11cqw] font-semibold leading-none tracking-tight text-on-surface">
        {text}
      </span>
    </div>
  );
}

function ResponsivePoster({ avif400, webp400, avif800, webp800, sizes, focus }: ResponsivePosterProps) {
  return (
    <picture aria-hidden="true" className="block size-full">
      <source sizes={sizes} srcSet={avif400 + ' 400w, ' + avif800 + ' 800w'} type="image/avif" />
      <source sizes={sizes} srcSet={webp400 + ' 400w, ' + webp800 + ' 800w'} type="image/webp" />
      <img
        alt=""
        className={'size-full object-cover ' + HOVER_SCALE}
        loading="lazy"
        sizes={sizes}
        src={webp400}
        style={{ objectPosition: focus ?? '50% 50%' }}
      />
    </picture>
  );
}

function HistoryMedia({ media, isActive, hasLink }: HistoryMediaProps) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isMediaInView = useInView(mediaRef, { threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isVideo = media.type === 'video';
  const shouldPlay = isVideo && isActive && isMediaInView && !prefersReducedMotion;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shouldPlay) {
      video?.pause();
      return;
    }

    void video.play().catch(() => undefined);

    return () => video.pause();
  }, [shouldPlay]);

  return (
    <div
      aria-hidden="true"
      className="@container absolute inset-0 aspect-[21/9] w-full overflow-hidden bg-surface-container-high lg:relative lg:inset-auto lg:aspect-[16/10] lg:w-[var(--history-thumb-w)] lg:shrink-0"
      ref={mediaRef}
    >
      {media.type === 'wordmark' && (
        <div className={'flex size-full items-center justify-center bg-surface-container-low px-4 ' + HOVER_SCALE}>
          <span className="whitespace-nowrap font-brand text-[12cqw] leading-none text-brand-red">{media.text}</span>
        </div>
      )}
      {media.type === 'keyword' && <KeywordMedia icon={media.icon} text={media.text} />}
      {media.type === 'image' && <ResponsivePoster {...historyAssets[media.asset]} focus={media.focus} sizes={MEDIA_SIZES} />}
      {media.type === 'video' && (
        <>
          <ResponsivePoster
            avif400={historyAssets.design.posterAvif400}
            avif800={historyAssets.design.posterAvif800}
            focus={media.focus}
            sizes={MEDIA_SIZES}
            webp400={historyAssets.design.posterWebp400}
            webp800={historyAssets.design.posterWebp800}
          />
          <video
            className={'absolute inset-0 size-full object-cover ' + HOVER_SCALE}
            loop
            muted
            playsInline
            poster={historyAssets.design.posterWebp400}
            preload="none"
            ref={videoRef}
            src={shouldPlay ? historyAssets.design.video : undefined}
            style={{ display: prefersReducedMotion ? 'none' : undefined, objectPosition: media.focus ?? '50% 50%' }}
          />
        </>
      )}
      {hasLink && (
        <span className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center bg-black/60 text-white backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <svg aria-hidden="true" className="size-5" fill="none" focusable="false" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 11L21.2 2.80005" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M22 6.8V2H17.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </span>
      )}
    </div>
  );
}

function HistoryPeriod({ start, end, presentLabel }: HistoryPeriodProps) {
  return (
    <span className="whitespace-nowrap font-label text-[10px] tabular-nums text-white sm:text-xs lg:text-xs xl:text-sm xl:text-on-surface-variant">
      <time dateTime={start.replace('.', '-')}>{start}</time>
      {' — '}
      {end ? <time dateTime={end.replace('.', '-')}>{end}</time> : presentLabel}
    </span>
  );
}

export function HistoryCard({ title, subtitle, start, end, href, media, side, isActive, presentLabel, linkSuffix }: HistoryCardProps) {
  const isLeft = side === 'left';
  const className = 'group relative block aspect-[21/9] min-w-0 w-full max-w-[560px] overflow-hidden rounded-sm lg:aspect-[16/10] lg:w-[var(--history-thumb-w)] xl:flex xl:aspect-auto xl:w-full xl:max-w-none xl:items-start xl:gap-5 xl:overflow-visible '
    + (isLeft ? 'xl:flex-row-reverse' : '');
  const body = (
    <>
      <HistoryMedia hasLink={Boolean(href)} isActive={isActive} media={media} />
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-gradient-to-t from-black/95 via-black/85 to-transparent xl:hidden" />
      <div className={'absolute inset-x-3 bottom-3 z-10 flex min-w-0 flex-row items-baseline gap-2 lg:inset-x-4 lg:bottom-3 lg:flex-col lg:items-start lg:gap-0.5 xl:relative xl:inset-auto xl:z-auto xl:flex-1 xl:py-1 '
        + (isLeft ? 'xl:items-end xl:text-right' : 'xl:items-start xl:text-left')}>
        <h4 className="min-w-0 flex-1 truncate font-headline text-base font-semibold leading-tight text-white lg:w-full lg:flex-none lg:line-clamp-2 lg:overflow-hidden lg:text-clip lg:whitespace-normal lg:break-keep lg:text-sm lg:leading-snug xl:text-2xl xl:leading-tight xl:text-on-surface">
          {title}
        </h4>
        <p className="hidden w-full overflow-hidden font-body text-xs leading-snug text-white/90 lg:line-clamp-2 lg:block lg:break-keep xl:text-sm xl:leading-relaxed xl:text-on-surface-variant">{subtitle}</p>
        <HistoryPeriod end={end} presentLabel={presentLabel} start={start} />
      </div>
    </>
  );

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a
      aria-label={title + ' ' + linkSuffix}
      className={className + ' focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {body}
    </a>
  );
}
