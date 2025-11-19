import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentModalProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

const CURRENT_PRIVACY_VERSION = 'v1.0';
const CURRENT_TERMS_VERSION = 'v1.0';

export function ConsentModal({ open, onConsent, onDecline }: ConsentModalProps) {
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [openedAt] = useState(Date.now());

  const handleConsent = () => {
    const readDuration = Math.floor((Date.now() - openedAt) / 1000);
    
    // Require at least 10 seconds of reading
    if (readDuration < 10) {
      alert('Please take time to read the privacy policy and terms of service.');
      return;
    }
    
    if (!hasReadPrivacy || !hasReadTerms) {
      alert('Please confirm you have read both documents.');
      return;
    }
    
    onConsent();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy & Terms of Service</DialogTitle>
          <DialogDescription>
            Please read and accept our privacy policy and terms of service to continue.
            This is required by COPPA to protect children's data.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 w-full rounded border p-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3">Privacy Policy ({CURRENT_PRIVACY_VERSION})</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">1. Children's Privacy Protection (COPPA Compliance)</h4>
                  <p className="text-muted-foreground mt-1">
                    Inner Odyssey is committed to protecting children's privacy. We comply with the Children's Online Privacy Protection Act (COPPA):
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 ml-4">
                    <li>We require verified parental consent before collecting any data from children</li>
                    <li>Parents can review, export, or delete their child's data at any time</li>
                    <li>We do not share children's data with third parties for marketing</li>
                    <li>We use encryption to protect sensitive information</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">2. Data We Collect</h4>
                  <p className="text-muted-foreground mt-1">For Parents:</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4">
                    <li>Email address (for account access)</li>
                    <li>Full name</li>
                    <li>Birth year (age verification only)</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">For Children (with parental consent):</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4">
                    <li>First name only (no last name required)</li>
                    <li>Grade level</li>
                    <li>Learning progress and quiz scores</li>
                    <li>Emotion check-ins (encrypted)</li>
                    <li>Activity timestamps</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">3. How We Use Data</h4>
                  <ul className="list-disc list-inside text-muted-foreground ml-4">
                    <li>Personalize learning experiences</li>
                    <li>Track educational progress</li>
                    <li>Generate parent reports</li>
                    <li>Improve platform features</li>
                    <li>Ensure child safety and security</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">4. Your Rights</h4>
                  <ul className="list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Access:</strong> View all data collected about your child</li>
                    <li><strong>Export:</strong> Download complete data in JSON or CSV format</li>
                    <li><strong>Delete:</strong> Permanently delete your child's account and all data</li>
                    <li><strong>Opt-out:</strong> Disable specific features like leaderboards</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">5. Data Security</h4>
                  <p className="text-muted-foreground mt-1">
                    We use industry-standard security measures including encryption, secure authentication, 
                    and regular security audits. Sensitive data like emotion logs are encrypted at rest.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">6. Data Retention</h4>
                  <p className="text-muted-foreground mt-1">
                    We retain data only as long as your account is active. Upon account deletion, 
                    all data is permanently removed within 30 days (7-day grace period, then immediate deletion).
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Terms of Service ({CURRENT_TERMS_VERSION})</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">1. Age Requirements</h4>
                  <p className="text-muted-foreground mt-1">
                    You must be at least 18 years old to create a parent account. Children under 13 
                    cannot create accounts independently.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">2. Account Security</h4>
                  <p className="text-muted-foreground mt-1">
                    You are responsible for maintaining the confidentiality of your account credentials. 
                    Notify us immediately of any unauthorized access.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">3. Acceptable Use</h4>
                  <p className="text-muted-foreground mt-1">
                    You agree not to misuse the platform, attempt to access other users' data, 
                    or use the service for any unlawful purpose.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">4. Service Availability</h4>
                  <p className="text-muted-foreground mt-1">
                    We strive for 99.9% uptime but do not guarantee uninterrupted service. 
                    We may perform maintenance with advance notice.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-primary">5. Changes to Terms</h4>
                  <p className="text-muted-foreground mt-1">
                    We may update these terms. You will be notified of material changes and 
                    asked to re-consent before continuing to use the service.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="privacy-consent" 
              checked={hasReadPrivacy}
              onCheckedChange={(checked) => setHasReadPrivacy(checked as boolean)}
            />
            <Label 
              htmlFor="privacy-consent" 
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the <strong>Privacy Policy</strong> and understand how my child's data will be collected, used, and protected.
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms-consent" 
              checked={hasReadTerms}
              onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
            />
            <Label 
              htmlFor="terms-consent" 
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the <strong>Terms of Service</strong> and agree to comply with all platform rules.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button 
            onClick={handleConsent} 
            disabled={!hasReadPrivacy || !hasReadTerms}
          >
            I Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION };
