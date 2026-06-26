// import "./globals.css";
// import { Inter } from "next/font/google";

// import { Poppins } from "next/font/google";

// export const metadata = {
//   title: "Quiz Forge",
//   icons: {
//     icon: "/logo.png",
//     shortcut: "/logo.png",
//     apple: "/logo.png",
//   },
// };

// export default function RootLayout({ children }: any) {
//   const poppins = Poppins({
//     subsets: ["latin"],
//     weight: ["300", "400", "500", "600", "700"],
//   });

//   return (
//     <html lang="en" className={inter.className}>
//       <body>{children}</body>
//     </html>
//   );
// }

import "./globals.css";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Quiz Forge",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
