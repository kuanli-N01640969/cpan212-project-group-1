
import { useState } from "react";

//sign in home page

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    console.log("Email:", email);
  }

  return (
    <div className="container">
      <h1>Sign In</h1>

      <form onSubmit={handleSubmit} className="signInForm">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
