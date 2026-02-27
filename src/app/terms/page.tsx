import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Lumin Aerial CRM",
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm mb-8">
            Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: February 2026
          </p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Agreement to Terms</h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you and
                <strong> Lumin Aerial LLC</strong> ("Lumin Aerial," "we," "us," or "our"), an Arizona limited
                liability company, regarding your access to and use of the Lumin Aerial CRM platform
                ("Platform") and all associated services.
              </p>
              <p className="mt-3">
                By accessing or using the Platform, you confirm that you have read, understood, and agree to
                be bound by these Terms. If you do not agree, you must not access or use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Services</h2>
              <p>
                Lumin Aerial LLC operates a nationwide network of FAA Part 107 certified drone pilots who
                provide aerial photography, videography, inspection, and data collection services to
                commercial clients. The Platform is an internal operations management system used to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Manage pilot profiles, certifications, and availability</li>
                <li>Dispatch and track job assignments across the pilot network</li>
                <li>Facilitate client project management and deliverable distribution</li>
                <li>Process invoicing, billing, and pilot compensation</li>
                <li>Maintain regulatory compliance documentation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Authorized Use &amp; Access</h2>
              <p>
                Access to this Platform is granted solely to authorized personnel — including Lumin Aerial
                administrators, contracted pilots, and approved clients. Credentials are personal and
                non-transferable.
              </p>
              <p className="mt-3">You agree to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Notify Lumin Aerial immediately of any unauthorized access to your account</li>
                <li>Use the Platform solely for its intended business purposes</li>
                <li>Not attempt to reverse-engineer, scrape, or exploit the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Pilot Obligations</h2>
              <p>Pilots contracting with Lumin Aerial agree to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Maintain a valid FAA Part 107 Remote Pilot Certificate at all times</li>
                <li>Carry required liability insurance and provide current Certificates of Insurance</li>
                <li>Comply with all applicable FAA regulations, airspace restrictions, and local ordinances</li>
                <li>Complete assigned jobs in a professional and timely manner</li>
                <li>Upload deliverables through the Platform as directed</li>
                <li>Keep compliance documentation current within the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Client Obligations</h2>
              <p>Clients accessing the Platform agree to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide accurate project information and site access as required</li>
                <li>Pay invoices within agreed-upon terms</li>
                <li>Use deliverables only as permitted under separate service agreements</li>
                <li>Not share platform credentials or project data with unauthorized third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Intellectual Property</h2>
              <p>
                The Lumin Aerial name, logo, and brand identity are trademarks of Lumin Aerial LLC.
                The "Lumin Aerial™" mark is the exclusive property of Lumin Aerial LLC. Unauthorized use
                is prohibited. This CRM platform is a proprietary product of NyxAerial. All platform
                software, design, and intellectual property are owned by NyxAerial. Unauthorized use
                of this trademark is prohibited.
              </p>
              <p className="mt-3">
                All content, code, design, and functionality of this Platform are the exclusive intellectual
                property of Lumin Aerial LLC and are protected under applicable copyright, trademark, and
                trade secret laws.
              </p>
              <p className="mt-3">
                © 2026 NyxAerial · All rights reserved. Built for Lumin Aerial LLC.
              </p>
              <p className="mt-3">
                Aerial content and deliverables produced under contract remain subject to the terms of
                the applicable client service agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Confidentiality</h2>
              <p>
                All information accessed through this Platform — including client identities, job details,
                pricing, pilot network information, and business processes — is confidential and proprietary
                to Lumin Aerial LLC. Users agree to maintain strict confidentiality and not disclose any
                such information to unauthorized parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Data &amp; Deliverables</h2>
              <p>
                Files uploaded to the Platform are stored securely and accessible only to authorized users
                with appropriate permissions. Lumin Aerial does not claim ownership of client-commissioned
                deliverables but retains the right to use anonymized project data for internal analytics
                and business improvement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Lumin Aerial LLC shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from use of or
                inability to use the Platform. Lumin Aerial's total liability for any claim shall not
                exceed the fees paid by the claimant in the three months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Lumin Aerial LLC, its officers, employees, and
                agents from any claims, damages, or expenses (including reasonable attorneys' fees) arising
                from your use of the Platform, violation of these Terms, or infringement of any third-party
                rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Termination</h2>
              <p>
                Lumin Aerial reserves the right to suspend or terminate access to the Platform at any time,
                with or without cause. Users may request account deactivation by contacting
                <a href="mailto:bsargent@luminaerial.com" className="text-blue-600 hover:underline ml-1">
                  bsargent@luminaerial.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of
                Arizona, without regard to conflict of law principles. Any disputes shall be resolved
                exclusively in the state or federal courts located in Maricopa County, Arizona.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Changes to Terms</h2>
              <p>
                Lumin Aerial reserves the right to modify these Terms at any time. Updated Terms will be
                posted within the Platform with a revised effective date. Continued use of the Platform
                after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">14. Contact</h2>
              <p>For questions about these Terms, contact:</p>
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
        © 2026 NyxAerial · All Rights Reserved ·{" "}
        <Link href="/privacy" className="hover:text-slate-600 underline">Privacy Policy</Link>
        {" "}·{" "}
        <Link href="/terms" className="hover:text-slate-600 underline">Terms of Service</Link>
      </footer>
    </div>
  );
}
