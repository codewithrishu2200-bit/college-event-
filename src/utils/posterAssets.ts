import heroCampusImg from "../assets/images/hero_campus_auditorium_1794562917440.jpg";
import techSymposiumImg from "../assets/images/poster_tech_symposium_1794562917520.jpg";
import culturalNightImg from "../assets/images/poster_cultural_night_1794562918072.jpg";
import cseBootcampImg from "../assets/images/poster_cse_bootcamp_1794562919295.jpg";
import eceSeminarImg from "../assets/images/poster_ece_seminar_1794562919419.jpg";

export const HERO_CAMPUS_IMAGE = heroCampusImg;

const LOCAL_POSTER_MAP: Record<string, string> = {
  "/src/assets/images/poster_tech_symposium_1794562917520.jpg": techSymposiumImg,
  "/src/assets/images/poster_cultural_night_1794562918072.jpg": culturalNightImg,
  "/src/assets/images/poster_cse_bootcamp_1794562919295.jpg": cseBootcampImg,
  "/src/assets/images/poster_ece_seminar_1794562919419.jpg": eceSeminarImg,
};

export function resolvePosterUrl(posterUrl: string | null | undefined): string | null {
  if (!posterUrl) return null;
  return LOCAL_POSTER_MAP[posterUrl] || posterUrl;
}
