import React from 'react';
import { Lock } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Account information (username, email)</li>
              <li>Game statistics and performance data</li>
              <li>Match history and team compositions</li>
              <li>Communication preferences</li>
              <li>Technical data (IP address, device information)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">Your information is used to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide and improve matchmaking services</li>
              <li>Maintain fair and balanced matches</li>
              <li>Prevent cheating and abuse</li>
              <li>Send important service updates</li>
              <li>Analyze and improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">3. Data Security</h2>
            <p className="text-gray-300">
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">4. Data Sharing</h2>
            <p className="text-gray-300 mb-4">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Other players (limited to public profile information)</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">5. Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">6. Cookies</h2>
            <p className="text-gray-300">
              We use cookies to enhance your experience, understand site usage, and assist in our marketing efforts. You can control cookies through your browser settings.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: March 15, 2024
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Contact us at privacy@marvelrivalsqueue.com for privacy-related questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}