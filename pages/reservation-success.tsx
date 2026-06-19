import Head from "next/head";
import Link from "next/link";

export default function ReservationSuccess() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Reservation Confirmed | Guest List Platform</title>
        <meta name="description" content="Your guest list reservation has been confirmed. See you at the event!" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 text-center">
        {/* Success Message */}
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6 mb-8 max-w-md shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Reservation Confirmed!</h2>
          
          <p className="text-gray-400 mb-4">Your spot has been reserved. See you at the event.</p>
          
          <div className="bg-purple-900/50 border border-pink-500/30 rounded px-4 py-3 font-mono text-lg tracking-wider">
            GL-8F4K29
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Link href="/" className="bg-gray-800 hover:bg-purple-900 text-white px-6 py-2 rounded transition-colors">
            Back to Events
          </Link>
          <Link href="/checkin" className="bg-gray-800 hover:bg-pink-900 text-white px-6 py-2 rounded transition-colors">
            Check-In System
          </Link>
        </div>

        {/* QR Code Placeholder */}
        <div className="mt-12 bg-black border border-purple-500/30 rounded-lg p-4 w-[150px] h-[150px]">
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            QR Code
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-4 text-sm text-gray-500">
          © 2026 Guest List Platform. All rights reserved.
        </footer>
      </main>
    </div>
  );
}