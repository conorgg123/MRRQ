import React from 'react';
import { Shield } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using Marvel Rivals Queue, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">2. Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily use Marvel Rivals Queue for personal, non-commercial matchmaking purposes only. This is the grant of a license, not a transfer of title.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>You must not use the service for any illegal or unauthorized purpose</li>
              <li>You must not interfere with or disrupt the service or servers</li>
              <li>You must not harass, abuse, or harm other users</li>
              <li>You must not attempt to gain unauthorized access to any portion of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">3. User Conduct</h2>
            <p className="text-gray-300 mb-4">
              Users are expected to maintain a positive and respectful environment. The following behaviors are prohibited:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Toxic behavior or harassment of any kind</li>
              <li>Intentionally throwing matches or griefing</li>
              <li>Boosting or account sharing</li>
              <li>Using cheats, hacks, or exploits</li>
              <li>Creating multiple accounts to circumvent bans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">4. Account Security</h2>
            <p className="text-gray-300">
              You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">5. Service Modifications</h2>
            <p className="text-gray-300">
              We reserve the right to modify or discontinue the service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-300">
              Marvel Rivals Queue shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-blue-400 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to update these terms at any time. Your continued use of the service after such modifications constitutes your acceptance of the new terms.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: April 15, 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}