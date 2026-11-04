export default function AboutUs() {
  return (
    <div className="aboutUs">
      <h1>About Us</h1>

      <div className="logSection">
        <h3>The aim of our app</h3>
        <p>Our app is intended for people who want a simple way to monitor daily calorie intake against a personal calorie target without manually calculating calories for every meal.</p>
        <p>The user sets a daily calorie goal and records the food they consume across three meal categories: breakfast, lunch, and dinner.</p>
        <p>The app uses nutrition data from an external API and quantity/unit conversion to calculate consumed calories, then clearly indicates whether the user is under or over their target.</p>
        <p>The MVP is designed around quick, structured meal entry rather than a full diet-planning or medical nutrition system.</p>
        <p> The main problem is reducing the manual work involved in converting food quantities into comparable calorie totals while keeping the users own meal records available in the app.</p>
      </div>
      <div className="logSection">
        <h3>Who we are</h3>
        <p>Kuan Yi Li</p>
        <p>Abeer Rashid</p>
        <p>Owen Fedchenko</p>
        <p>Maliki Cornwall-Douglas</p>
      </div>
    </div>
  );
}