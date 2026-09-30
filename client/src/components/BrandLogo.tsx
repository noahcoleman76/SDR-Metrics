import { useTheme } from "../context/ThemeContext";

export function BrandLogo({ className }: { className: string }) {
  const { mode } = useTheme();
  const src = mode === "dark" ? "/sdr-logo-dark.png" : "/sdr-logo-light.png";
  return <img src={src} alt="SDR Metrics" className={className} />;
}
