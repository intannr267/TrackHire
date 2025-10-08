"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center font-mono">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400 drop-shadow-[3px_3px_0px_#ff0080]">
        Job Tracker Login
      </h1>
      <div className="bg-black/70 p-8 rounded-xl border-4 border-pink-500 w-96">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-black border-2 border-yellow-400 text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-black border-2 border-pink-500 text-white placeholder-gray-500"
        />

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-pink-500 hover:text-white transition-all border-4 border-black"
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}
