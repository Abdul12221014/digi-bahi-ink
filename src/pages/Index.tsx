import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { LedgerTable } from '@/components/LedgerTable';
import { EntryForm } from '@/components/EntryForm';
import { PenCanvas } from '@/components/PenCanvas';
import { Reports } from '@/features/Reports';
import { UPIIntegration } from '@/features/UPIIntegration';
import { CreditManager } from '@/features/CreditManager';
import { WhatsAppShare } from '@/features/WhatsAppShare';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initializeDB } from '@/lib/db';
import { toast } from 'sonner';
import { LayoutDashboard, BookOpen, PenTool, FileText, CreditCard, MessageCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

const Index = () => {
  const { i18n } = useTranslation();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showPenCanvas, setShowPenCanvas] = useState(false);
  const [refreshLedger, setRefreshLedger] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    initializeDB();
  }, []);

  const handleEntrySuccess = () => {
    setShowEntryForm(false);
    setRefreshLedger(prev => prev + 1);
    setActiveTab('ledger');
  };

  const handlePenRecognized = (text: string) => {
    toast.info('Recognized: ' + text);
    setShowEntryForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b shadow-medium bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 animate-slide-in">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-medium">
                <span className="text-2xl font-bold text-white">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
                  DigBahi
                </h1>
                <p className="text-xs text-muted-foreground">Professional Accounting</p>
              </div>
            </div>
            <div className="flex items-center gap-3 animate-fade-in">
              <Select value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
                <SelectTrigger className="w-32 touch-friendly hover-lift border-primary/20">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowPenCanvas(true)}
                className="touch-friendly gradient-hero hover:shadow-glow transition-smooth"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Pen Input
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-6 mb-8 p-1.5 bg-card shadow-medium">
              <TabsTrigger value="dashboard" className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="ledger" className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth">
                <BookOpen className="w-4 h-4 mr-2" />
                Ledger
              </TabsTrigger>
              <TabsTrigger value="reports" className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="upi" className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth">
                <CreditCard className="w-4 h-4 mr-2" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="credit" className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth">
                <CreditCard className="w-4 h-4 mr-2" />
                Credit
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
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
              <Reports />
            </TabsContent>

            <TabsContent value="upi">
              <UPIIntegration />
            </TabsContent>

            <TabsContent value="credit">
              <CreditManager />
            </TabsContent>

            <TabsContent value="whatsapp">
              <WhatsAppShare />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8 bg-card shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <span className="text-lg font-bold text-white">D</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
                DigBahi
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">DigBahi Accounting Solutions LLP © 2025</p>
              <p>Professional accounting software for Indian SMEs</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
