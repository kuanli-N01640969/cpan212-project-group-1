import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>CALORIE TRACKER</h2>

      <div className="navLinks">
        <Link href="/">Sign In</Link>
        <Link href="/dailylogs">Daily Logs</Link>
        <Link href="/nutritioninfo">Nutritional Information</Link>
        <Link href="/about">About Us</Link>
      </div>
    </nav>
  );
}

