import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BackButton to="/" />
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary">Legal</Badge>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <Card>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert pt-6">
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing Inner Odyssey by Flashfusion, you agree to these Terms of Service. If you do not agree, please do not use our platform.
              </p>

              <h2>Beta Program Terms</h2>
              <p>Inner Odyssey is currently in beta testing. By participating, you acknowledge:</p>
              <ul>
                <li>The platform may have bugs or incomplete features</li>
                <li>Features may change without notice</li>
                <li>We appreciate your feedback to improve the platform</li>
                <li>Beta access is free, with no payment required</li>
                <li>We may discontinue beta access at any time with notice</li>
              </ul>

              <h2>Account Creation</h2>
              <p>To use Inner Odyssey, you must:</p>
              <ul>
                <li>Be at least 18 years old (or have parental consent)</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>

              <h2>User Responsibilities</h2>
              <p>You agree to:</p>
              <ul>
                <li>Use the platform for lawful educational purposes only</li>
                <li>Not share your account with others</li>
                <li>Supervise your child's use of the platform</li>
                <li>Provide honest and constructive feedback during beta</li>
                <li>Not attempt to hack, reverse engineer, or exploit the platform</li>
              </ul>

              <h2>Acceptable Use Policy</h2>
              <p>You may NOT:</p>
              <ul>
                <li>Upload harmful, offensive, or inappropriate content</li>
                <li>Harass, bully, or threaten other users</li>
                <li>Impersonate others or create fake accounts</li>
                <li>Use the platform to spam or distribute malware</li>
                <li>Scrape or collect data without permission</li>
              </ul>

              <h2>Intellectual Property</h2>
              <p>
                All content, including lessons, quests, graphics, and code, is owned by Flashfusion, Inc. You may not:
              </p>
              <ul>
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our trademarks or branding without authorization</li>
                <li>Create derivative works based on our platform</li>
              </ul>
              <p>
                User-generated content (journals, drawings) remains your property, but you grant us a license to display it within the platform.
              </p>

              <h2>Beta Tester Benefits</h2>
              <p>As a beta tester, you may receive:</p>
              <ul>
                <li>Free access during beta period</li>
                <li>Lifetime discount on future paid plans (up to 50% off)</li>
                <li>Exclusive Founding Family badge</li>
                <li>Early access to new features</li>
              </ul>
              <p>
                These benefits are subject to change. We reserve the right to modify or terminate benefits with notice.
              </p>

              <h2>Payment Terms (Future)</h2>
              <p>When we transition to paid plans:</p>
              <ul>
                <li>Beta testers will receive grandfathered pricing</li>
                <li>Billing will be monthly or annual, at your choice</li>
                <li>You can cancel anytime without penalty</li>
                <li>Refunds available within 30 days of payment</li>
              </ul>

              <h2>Limitation of Liability</h2>
              <p>
                Inner Odyssey is provided "as is" during beta. We are not liable for:
              </p>
              <ul>
                <li>Service interruptions or data loss</li>
                <li>Educational outcomes or academic performance</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
              <p>
                Our maximum liability is limited to the amount you've paid (currently $0 during beta).
              </p>

              <h2>Termination</h2>
              <p>We may suspend or terminate your account if you:</p>
              <ul>
                <li>Violate these Terms of Service</li>
                <li>Engage in abusive or harmful behavior</li>
                <li>Fail to respond to verification requests</li>
              </ul>
              <p>You may delete your account anytime from settings.</p>

              <h2>Dispute Resolution</h2>
              <p>Any disputes will be resolved through:</p>
              <ul>
                <li>Informal negotiation first</li>
                <li>Binding arbitration if negotiation fails</li>
                <li>Governed by the laws of Delaware, USA</li>
              </ul>

              <h2>Changes to Terms</h2>
              <p>
                We may update these Terms periodically. We will notify you via email of significant changes. Continued use constitutes acceptance.
              </p>

              <h2>Contact</h2>
              <p>Questions about these Terms? Contact us at:</p>
              <ul>
                <li>Email: legal@flashfusion.com</li>
                <li>Response time: Within 5 business days</li>
              </ul>

              <p className="text-sm text-muted-foreground mt-8">
                © 2025 Flashfusion, Inc. All rights reserved.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Terms;
