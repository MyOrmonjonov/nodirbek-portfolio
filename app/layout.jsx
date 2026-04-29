import "./globals.css";

export const metadata = {
  title: "Nodirbek Yunosov | Portfolio",
  description: "Grafik dizayner portfolio sayti",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
