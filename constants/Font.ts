import { matchFont } from "@shopify/react-native-skia";
import { Platform } from "react-native";

type Slant = "normal" | "italic" | "oblique";
type Weight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export const FontFamily = Platform.select({ ios: "Helvetica", default: "serif" });

export const FontStyle = {
  fontFamily: FontFamily,
  fontSize: 14,
  fontStyle: "italic" as Slant,
  fontWeight: "bold" as Weight,
};

export const Font = matchFont(FontStyle);