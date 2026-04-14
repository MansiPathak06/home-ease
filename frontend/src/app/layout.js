
import Footer from "./Footer";
import "./globals.css";
import Navbar from "./Navbar";
import ChatBot from "@/components/ChatBot";
import CursorEffect from "@/components/CursorEffect";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CursorEffect />
          <div className="cursor-dot"></div>
  <div className="cursor-ring"></div>
        <Navbar/>
        {children}
        <Footer/>
        <ChatBot />
      </body>
    </html>
  );
}
