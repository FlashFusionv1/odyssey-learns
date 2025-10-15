import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Privacy = () => {
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
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <Card>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert pt-6">
              <h2>Introduction</h2>
              <p>
                Inner Odyssey by Flashfusion ("we," "our," or "us") is committed to protecting the privacy of children and their families. This Privacy Policy explains how we collect, use, and safeguard information when you use our platform.
              </p>

              <h2>COPPA Compliance</h2>
              <p>
                We comply with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13 without verifiable parental consent.
              </p>
              <ul>
                <li>Parents must create accounts and provide consent</li>
                <li>We collect only necessary information for educational purposes</li>
                <li>Parents can review and delete their child's data at any time</li>
                <li>We never sell or share children's data with third parties</li>
              </ul>

              <h2>Information We Collect</h2>
              
              <h3>Parent Information:</h3>
              <ul>
                <li>Email address (for account creation and communication)</li>
                <li>Name (for personalization)</li>
                <li>Timezone (for scheduling and reports)</li>
              </ul>

              <h3>Child Information:</h3>
              <ul>
                <li>Username (no real names required)</li>
                <li>Grade level (for content appropriateness)</li>
                <li>Learning preferences (visual, auditory, etc.)</li>
              </ul>

              <h3>Activity Data:</h3>
              <ul>
                <li>Lesson completion and scores (educational purposes)</li>
                <li>Time spent on activities (progress tracking)</li>
                <li>Emotion logs (emotional intelligence development)</li>
              </ul>

              <h2>How We Use Information</h2>
              <p>We use collected information solely for:</p>
              <ul>
                <li>Personalizing learning experiences</li>
                <li>Tracking educational progress</li>
                <li>Providing parent insights and reports</li>
                <li>Improving our platform based on aggregate data</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>
                <strong>We do NOT sell, rent, or share personal information with third parties for marketing purposes.</strong>
              </p>
              <p>We may share information only in these limited circumstances:</p>
              <ul>
                <li>With parent consent for school integrations</li>
                <li>When required by law (e.g., legal subpoenas)</li>
                <li>To protect safety and prevent harm</li>
              </ul>

              <h2>Data Security</h2>
              <p>We implement industry-standard security measures:</p>
              <ul>
                <li>256-bit SSL encryption for all data transmission</li>
                <li>Encrypted storage of sensitive information</li>
                <li>Regular security audits and updates</li>
                <li>Restricted employee access to personal data</li>
              </ul>

              <h2>Parent Rights</h2>
              <p>Parents have the right to:</p>
              <ul>
                <li>Access all data collected about their child</li>
                <li>Request correction of inaccurate information</li>
                <li>Delete their child's account and all associated data</li>
                <li>Export data in machine-readable format (JSON/CSV)</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2>Cookies and Tracking</h2>
              <p>We use essential cookies only:</p>
              <ul>
                <li>Authentication cookies (keep you logged in)</li>
                <li>Preference cookies (remember settings)</li>
              </ul>
              <p>We do NOT use advertising or third-party tracking cookies.</p>

              <h2>Third-Party Services</h2>
              <p>We use the following trusted services:</p>
              <ul>
                <li>Lovable Cloud (backend hosting and authentication)</li>
                <li>All services are COPPA-compliant with strict privacy policies</li>
              </ul>

              <h2>Data Retention</h2>
              <p>
                We retain data as long as your account is active. Upon account deletion, we permanently delete all personal information within 30 days, except where required by law to retain.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify parents via email of significant changes. Continued use after changes constitutes acceptance.
              </p>

              <h2>Contact Us</h2>
              <p>For privacy concerns or to exercise your rights:</p>
              <ul>
                <li>Email: privacy@flashfusion.com</li>
                <li>Response time: Within 48 hours</li>
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

export default Privacy;
