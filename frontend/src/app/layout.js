
import Footer from "./Footer";
import "./globals.css";
import Navbar from "./Navbar";
import ChatBot from "@/components/ChatBot";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        {children}
        <Footer/>
        <ChatBot />
      </body>
    </html>
  );
}
