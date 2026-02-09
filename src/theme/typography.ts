import { TextStyle } from "react-native";

export const fonts = {
  displayBold: "Rajdhani_700Bold",
  displaySemiBold: "Rajdhani_600SemiBold",
  displayRegular: "Rajdhani_400Regular",
  mono: "ShareTechMono_400Regular",
};

export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
  },
  displayMd: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
  },
  heading: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: fonts.mono,
    fontSize: 16,
  },
  bodySm: {
    fontFamily: fonts.mono,
    fontSize: 14,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 16,
  },
  monoSm: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
};
