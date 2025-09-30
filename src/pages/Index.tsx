import { useState, useEffect } from 'react';
import { Auth } from '@/components/Auth';
import { Dashboard } from '@/components/Dashboard';
import { LedgerTable } from '@/components/LedgerTable';
import { EntryForm } from '@/components/EntryForm';
import { PenCanvas } from '@/components/PenCanvas';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, logout } from '@/lib/auth';
import { initializeDB } from '@/lib/db';
import { toast } from 'sonner';
import { LayoutDashboard, BookOpen, PenTool, LogOut, FileText } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showPenCanvas, setShowPenCanvas] = useState(false);
  const [refreshLedger, setRefreshLedger] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    initializeDB();
    const user = getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const handleEntrySuccess = () => {
    setShowEntryForm(false);
    setRefreshLedger(prev => prev + 1);
    setActiveTab('ledger');
  };

  const handlePenRecognized = (text: string) => {
    toast.info('Recognized: ' + text);
    setShowEntryForm(true);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b shadow-soft bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/icon-192.png" alt="DigBahi" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold text-primary">DigBahi</h1>
                <p className="text-xs text-muted-foreground">Professional Accounting</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPenCanvas(true)}
                variant="outline"
                className="touch-friendly"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Pen Input
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="touch-friendly"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showPenCanvas ? (
          <PenCanvas
            onRecognized={handlePenRecognized}
            onClose={() => setShowPenCanvas(false)}
          />
        ) : showEntryForm ? (
          <EntryForm
            onSuccess={handleEntrySuccess}
            onCancel={() => setShowEntryForm(false)}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="dashboard" className="touch-friendly">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="ledger" className="touch-friendly">
                <BookOpen className="w-4 h-4 mr-2" />
                Ledger
              </TabsTrigger>
              <TabsTrigger value="reports" className="touch-friendly">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="ledger">
              <LedgerTable
                onAddEntry={() => setShowEntryForm(true)}
                refresh={refreshLedger}
              />
            </TabsContent>

            <TabsContent value="reports">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Reports Module</h2>
                <p className="text-muted-foreground">
                  P&L statements, GST reports, and export features coming soon!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DigBahi Accounting Solutions LLP © 2025</p>
          <p className="mt-1">Professional accounting software for Indian SMEs</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
