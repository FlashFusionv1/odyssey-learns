import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Activity, UserX } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RateLimitViolation {
  id: string;
  parent_id: string;
  violation_type: string;
  metadata: any;
  created_at: string;
}

interface RoleAudit {
  id: string;
  user_id: string;
  role: string;
  action: string;
  performed_by: string;
  performed_at: string;
  reason?: string;
}

export default function SecurityMonitoring() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [roleAudits, setRoleAudits] = useState<RoleAudit[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_current_user_admin');
        if (error) throw error;
        
        if (!data) {
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        await loadSecurityData();
      } catch (error) {
        console.error('Admin check failed:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  const loadSecurityData = async () => {
    try {
      // Load rate limit violations (last 7 days)
      const { data: violationData } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (violationData) setViolations(violationData);

      // Load role audit log (last 30 days)
      const { data: auditData } = await supabase
        .from('role_audit_log')
        .select('*')
        .gte('performed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('performed_at', { ascending: false })
        .limit(100);

      if (auditData) setRoleAudits(auditData);

    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const violationsByType = violations.reduce((acc, v) => {
    acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentViolations = violations.slice(0, 20);
  const recentAudits = roleAudits.slice(0, 20);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring</h1>
          <p className="text-muted-foreground">Real-time security events and audit logs</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violationsByType['collaboration_request'] || 0}</div>
            <p className="text-xs text-muted-foreground">Exceeded requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Role Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleAudits.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              All Systems Normal
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Logs */}
      <Tabs defaultValue="violations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="violations">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Rate Limit Violations
          </TabsTrigger>
          <TabsTrigger value="audits">
            <Activity className="h-4 w-4 mr-2" />
            Role Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rate Limit Violations</CardTitle>
              <CardDescription>
                Users who exceeded rate limits in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentViolations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No violations detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentViolations.map((violation) => (
                    <div key={violation.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">
                            {violation.violation_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(violation.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground">
                          Parent ID: {violation.parent_id.slice(0, 8)}...
                        </p>
                        {violation.metadata && (
                          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(violation.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                      <UserX className="h-5 w-5 text-destructive" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Change Audit Log</CardTitle>
              <CardDescription>
                All role assignments, updates, and revocations in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAudits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No role changes recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAudits.map((audit) => (
                    <div key={audit.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            audit.action === 'assigned' ? 'default' :
                            audit.action === 'revoked' ? 'destructive' : 'secondary'
                          }>
                            {audit.action.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{audit.role}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(audit.performed_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          User: <span className="font-mono">{audit.user_id.slice(0, 8)}...</span>
                        </p>
                        {audit.performed_by && (
                          <p className="text-sm text-muted-foreground">
                            By: <span className="font-mono">{audit.performed_by.slice(0, 8)}...</span>
                          </p>
                        )}
                        {audit.reason && (
                          <p className="text-sm mt-1 text-muted-foreground italic">
                            Reason: {audit.reason}
                          </p>
                        )}
                      </div>
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
