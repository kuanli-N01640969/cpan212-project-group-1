import "../styles/globals.css";
import Navbar from "../components/navbar";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

//TODO: Daily log forms and display
//TODO: Implement call API on dailylog.js
//TODO: Nutrition Info dropbar and display
//TODO: Implement call API on nutritioninfo.js
//TODO: About Page
//TODO: Cleanup Sign in 
//TODO: Global CSS
