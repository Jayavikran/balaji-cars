import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function PrivacyPolicy() {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.companyName || 'BALAJI CARS';
  const email = settings?.email || 'contact@balajicars.in';
  const phone = settings?.phoneNumber;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Privacy Policy"
        description={`How ${siteName} collects, uses, and protects your personal information.`}
        canonical="/privacy-policy"
        noindex
      />
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-body">Last updated: {new Date().getFullYear()}</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-body">
          <section>
            <h2 className="text-base font-semibold text-ink">1. Information We Collect</h2>
            <p className="mt-2">
              When you submit an enquiry, contact us, or browse our car listings, we may collect your
              name, phone number, email address, and any message or preferences you share with us.
              We do not collect payment or financial information through this website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">2. How We Use Your Information</h2>
            <p className="mt-2">
              We use the information you provide solely to respond to your enquiries, follow up on
              interest in a vehicle, and improve our services. We do not sell or rent your personal
              information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">3. Data Storage & Security</h2>
            <p className="mt-2">
              Enquiry details are stored securely and accessed only by {siteName} staff for the
              purpose of following up with you. We take reasonable technical and organizational
              measures to protect your data against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">4. Cookies</h2>
            <p className="mt-2">
              Our website may use basic cookies or local storage to remember preferences such as
              your saved comparison list or favourited cars. These are not used for third-party
              advertising or tracking.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">5. Your Rights</h2>
            <p className="mt-2">
              You may request access to, correction of, or deletion of the personal information we
              hold about you at any time by contacting us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">6. Contact Us</h2>
            <p className="mt-2">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href={`mailto:${email}`} className="text-navy underline">{email}</a>
              {phone && (
                <>
                  {' '}or call{' '}
                  <a href={`tel:${phone}`} className="text-navy underline">{phone}</a>
                </>
              )}
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
