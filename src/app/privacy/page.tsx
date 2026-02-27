import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Lumin Aerial CRM",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold">LA</span>
            Lumin Aerial
          </Link>
          <Link href="/login" className="text-sm text-blue-600 hover:underline">? Back to login</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm mb-8">
            Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: February 2026
          </p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                Lumin Aerial LLC ("Lumin Aerial," "we," "us," or "our") is committed to protecting the
                privacy and security of your personal information. This Privacy Policy explains how we
                collect, use, store, and protect information gathered through the Lumin Aerial CRM
                Platform ("Platform").
              </p>
              <p className="mt-3">
                This Platform is an internal business operations tool. Access is restricted to authorized
                administrators, contracted pilots, and approved clients only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
              <h3 className="font-medium text-slate-800 mt-4 mb-2">Account Information</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Full name, email address, and role (admin, pilot, or client)</li>
                <li>Encrypted password credentials</li>
                <li>Account creation and last-login timestamps</li>
              </ul>

              <h3 className="font-medium text-slate-800 mt-4 mb-2">Pilot Information</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>FAA Part 107 certificate number and expiration date</li>
                <li>Insurance certificates (COI) and policy details</li>
                <li>W-9 tax documentation status</li>
                <li>Geographic service markets (state and city)</li>
                <li>Equipment inventory (make, model, serial numbers)</li>
                <li>Biography, contact details, and availability status</li>
                <li>Payment history and payout records</li>
              </ul>

              <h3 className="font-medium text-slate-800 mt-4 mb-2">Client Information</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Company name, contact name, phone, and email</li>
                <li>Billing address and company type (agency, commercial, real estate)</li>
                <li>Project history and invoice records</li>
              </ul>

              <h3 className="font-medium text-slate-800 mt-4 mb-2">Job &amp; Project Data</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Job titles, descriptions, locations (city/state), and scheduled dates</li>
                <li>Pilot assignment records</li>
                <li>Deliverable files (photos, videos, reports)</li>
                <li>Internal notes and communication logs</li>
                <li>Pricing and invoice data</li>
              </ul>

              <h3 className="font-medium text-slate-800 mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Session tokens for authentication (stored securely, not shared)</li>
                <li>Browser type and device information for security purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
              <p>We use the information collected solely to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Operate and manage the Lumin Aerial pilot dispatch network</li>
                <li>Assign and track drone service jobs</li>
                <li>Process client billing and pilot payments</li>
                <li>Maintain FAA regulatory compliance documentation</li>
                <li>Communicate with pilots and clients about active projects</li>
                <li>Improve platform functionality and internal operations</li>
                <li>Comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Sharing &amp; Disclosure</h2>
              <p>
                We do <strong>not</strong> sell, rent, or trade your personal information to third parties.
              </p>
              <p className="mt-3">We may share information only in the following limited circumstances:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  <strong>Within the Platform:</strong> Pilot information is visible to administrators.
                  Client-specific job and invoice data is visible to the respective client only.
                </li>
                <li>
                  <strong>Service providers:</strong> Trusted hosting and infrastructure providers
                  (e.g., Vercel, Railway) who process data solely on our behalf and are bound by
                  confidentiality obligations.
                </li>
                <li>
                  <strong>Legal requirements:</strong> When disclosure is required by law, court order,
                  or government authority.
                </li>
                <li>
                  <strong>Business transfer:</strong> In the event of a merger, acquisition, or sale of
                  Lumin Aerial's business assets, with appropriate confidentiality protections.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>bcrypt password hashing (salted, 12 rounds)</li>
                <li>JWT-based authentication with secure session tokens</li>
                <li>HTTPS encryption for all data in transit</li>
                <li>Role-based access controls limiting data visibility by user type</li>
                <li>Database access restricted to authorized application services only</li>
              </ul>
              <p className="mt-3">
                No security system is impenetrable. In the event of a data breach, we will notify
                affected users promptly in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to fulfill
                the purposes described in this policy. Pilot compliance and payment records may be retained
                for up to 7 years to satisfy tax and regulatory obligations. You may request deletion of
                your account data by contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal retention obligations)</li>
                <li>Object to or restrict certain data processing activities</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:bsargent@luminaerial.com" className="text-blue-600 hover:underline">
                  bsargent@luminaerial.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Cookies &amp; Session Storage</h2>
              <p>
                This Platform uses essential session cookies solely for authentication purposes. We do not
                use advertising cookies, tracking pixels, or third-party analytics services that collect
                personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Children's Privacy</h2>
              <p>
                This Platform is intended for business use by adults only. We do not knowingly collect
                information from individuals under the age of 18. If you believe a minor has provided
                information through our Platform, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be posted within the Platform
                with a revised effective date. Your continued use of the Platform constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact Us</h2>
              <p>For questions, concerns, or requests regarding this Privacy Policy:</p>
              <div className="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="font-semibold text-slate-900">Lumin Aerial LLC</p>
                <p>Bailey Sargent, Owner</p>
                <p>
                  <a href="mailto:bsargent@luminaerial.com" className="text-blue-600 hover:underline">
                    bsargent@luminaerial.com
                  </a>
                </p>
                <p>
                  <a href="https://www.luminaerial.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    www.luminaerial.com
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <footer className="text-center text-slate-400 text-xs py-8">
        © 2026 NyxAerial · Built for Lumin Aerial LLC · All Rights Reserved ·{" "}
        <Link href="/privacy" className="hover:text-slate-600 underline">Privacy Policy</Link>
        {" "}·{" "}
        <Link href="/terms" className="hover:text-slate-600 underline">Terms of Service</Link>
      </footer>
    </div>
  );
}
