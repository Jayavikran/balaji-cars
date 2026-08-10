import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Seo from '@/components/shared/Seo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function TermsOfService() {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.companyName || 'BALAJI CARS';
  const email = settings?.email || 'contact@balajicars.in';
  const phone = settings?.phoneNumber;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Terms of Service"
        description={`The terms and conditions for using the ${siteName} website.`}
        noindex
      />
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-body">Last updated: {new Date().getFullYear()}</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-body">
          <section>
            <h2 className="text-base font-semibold text-ink">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using the {siteName} website, you agree to be bound by these Terms of
              Service. If you do not agree with any part of these terms, please do not use this
              website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">2. Vehicle Listings</h2>
            <p className="mt-2">
              All vehicle details, prices, and availability shown on this website are provided for
              informational purposes and are subject to change without notice. We make reasonable
              efforts to keep listings accurate, but we do not guarantee that every detail is
              error-free or current. Please confirm all details with us directly before making a
              purchase decision.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">3. Enquiries & Communication</h2>
            <p className="mt-2">
              When you submit an enquiry through this website, you consent to being contacted by
              {' '}{siteName} via phone, WhatsApp, or email regarding your enquiry.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">4. No Warranty</h2>
            <p className="mt-2">
              This website and its content are provided "as is" without warranties of any kind,
              express or implied. We are not liable for any loss or damage arising from your use of
              this website or reliance on information published on it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">5. Changes to These Terms</h2>
            <p className="mt-2">
              We may update these Terms of Service from time to time. Continued use of the website
              after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink">6. Contact Us</h2>
            <p className="mt-2">
              Questions about these Terms of Service can be sent to{' '}
              <a href={`mailto:${email}`} className="text-navy underline">{email}</a>
              {phone && (
                <>
                  {' '}or by calling{' '}
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
