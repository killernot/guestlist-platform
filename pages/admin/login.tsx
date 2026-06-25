import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/admin");
    }
  };

  return (
    <>
      <Head>
        <title>Login - GuestList Platform</title>
      </Head>

      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-black border border-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <Link href="/" className="block mt-4 text-center text-sm hover:text-blue-400">
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
