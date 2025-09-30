import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db, LedgerEntry } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/gst';
import { toast } from 'sonner';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export function Reports() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const allEntries = await db.ledger.orderBy('date').reverse().toArray();
      setEntries(allEntries);
    } catch (error) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }

  const calculateTotals = () => {
    const sales = entries.filter(e => e.type === 'sale').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    const purchases = entries.filter(e => e.type === 'purchase').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    const expenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount + e.gstAmount, 0);
    const receipts = entries.filter(e => e.type === 'receipt').reduce((sum, e) => sum + e.amount, 0);
    const gstCollected = entries.filter(e => e.type === 'sale').reduce((sum, e) => sum + e.gstAmount, 0);
    const gstPaid = entries.filter(e => ['purchase', 'expense'].includes(e.type)).reduce((sum, e) => sum + e.gstAmount, 0);

    return { sales, purchases, expenses, receipts, gstCollected, gstPaid };
  };

  const exportPDF = (reportType: 'pl' | 'gst' | 'ledger') => {
    const doc = new jsPDF();
    const totals = calculateTotals();
    
    // Header
    doc.setFontSize(20);
    doc.text('DigBahi', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Professional Accounting Solutions', 105, 28, { align: 'center' });
    doc.line(20, 32, 190, 32);

    let yPos = 45;

    if (reportType === 'pl') {
      // Profit & Loss Statement
      doc.setFontSize(16);
      doc.text('Profit & Loss Statement', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.text(`Period: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos);
      yPos += 15;

      // Income
      doc.setFontSize(12);
      doc.text('Income', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Sales Revenue: ${formatCurrency(totals.sales)}`, 30, yPos);
      yPos += 6;
      doc.text(`Other Receipts: ${formatCurrency(totals.receipts)}`, 30, yPos);
      yPos += 6;
      doc.text(`Total Income: ${formatCurrency(totals.sales + totals.receipts)}`, 30, yPos);
      yPos += 12;

      // Expenses
      doc.setFontSize(12);
      doc.text('Expenses', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Purchases: ${formatCurrency(totals.purchases)}`, 30, yPos);
      yPos += 6;
      doc.text(`Operating Expenses: ${formatCurrency(totals.expenses)}`, 30, yPos);
      yPos += 6;
      doc.text(`Total Expenses: ${formatCurrency(totals.purchases + totals.expenses)}`, 30, yPos);
      yPos += 12;

      // Net Profit/Loss
      const netPL = (totals.sales + totals.receipts) - (totals.purchases + totals.expenses);
      doc.setFontSize(12);
      doc.text(`Net ${netPL >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(Math.abs(netPL))}`, 20, yPos);

    } else if (reportType === 'gst') {
      // GST Report
      doc.setFontSize(16);
      doc.text('GST Report', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.text(`Period: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos);
      yPos += 15;

      doc.setFontSize(10);
      doc.text(`GST Collected (Output Tax): ${formatCurrency(totals.gstCollected)}`, 20, yPos);
      yPos += 8;
      doc.text(`GST Paid (Input Tax Credit): ${formatCurrency(totals.gstPaid)}`, 20, yPos);
      yPos += 8;
      const netGST = totals.gstCollected - totals.gstPaid;
      doc.text(`Net GST ${netGST >= 0 ? 'Payable' : 'Refundable'}: ${formatCurrency(Math.abs(netGST))}`, 20, yPos);
      yPos += 15;

      // GST Breakdown by Rate
      doc.text('GST Breakdown by Rate:', 20, yPos);
      yPos += 8;
      const gstByRate = entries.reduce((acc, e) => {
        if (e.gstRate > 0) {
          if (!acc[e.gstRate]) acc[e.gstRate] = 0;
          acc[e.gstRate] += e.gstAmount;
        }
        return acc;
      }, {} as Record<number, number>);

      Object.entries(gstByRate).forEach(([rate, amount]) => {
        doc.text(`  ${rate}% GST: ${formatCurrency(amount)}`, 30, yPos);
        yPos += 6;
      });

    } else {
      // Ledger Summary
      doc.setFontSize(16);
      doc.text('Ledger Summary', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.text(`Total Entries: ${entries.length}`, 20, yPos);
      yPos += 15;

      doc.setFontSize(10);
      entries.slice(0, 20).forEach(entry => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${formatDate(entry.date)} - ${entry.description}`, 20, yPos);
        yPos += 5;
        doc.text(`${entry.type.toUpperCase()}: ${formatCurrency(entry.amount + entry.gstAmount)}`, 30, yPos);
        yPos += 8;
      });

      if (entries.length > 20) {
        doc.text(`... and ${entries.length - 20} more entries`, 20, yPos);
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.text('Generated by DigBahi Accounting Solutions', 105, 285, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleString('en-IN')}`, 105, 290, { align: 'center' });

    // Save PDF
    doc.save(`${reportType}_report_${Date.now()}.pdf`);
    toast.success('Report exported successfully');
  };

  const exportCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Type', 'Amount', 'GST Rate', 'GST Amount', 'Total'],
      ...entries.map(e => [
        e.date,
        e.description,
        e.type,
        e.amount.toString(),
        `${e.gstRate}%`,
        e.gstAmount.toString(),
        (e.amount + e.gstAmount).toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `ledger_${Date.now()}.csv`);
    toast.success('Ledger exported to CSV');
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-ledger-header">Reports & Analytics</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 shadow-soft gradient-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">Profit & Loss Statement</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive income and expense report with net profit/loss calculation
            </p>
            <Button
              onClick={() => exportPDF('pl')}
              className="w-full gradient-hero touch-friendly"
            >
              <Download className="w-4 h-4 mr-2" />
              Export P&L (PDF)
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-soft gradient-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">GST Report</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Detailed GST collected, paid, and net liability for GST portal filing
            </p>
            <Button
              onClick={() => exportPDF('gst')}
              className="w-full gradient-hero touch-friendly"
            >
              <Download className="w-4 h-4 mr-2" />
              Export GST (PDF)
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-soft gradient-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">Ledger Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete ledger entries with transaction details and GST breakdown
            </p>
            <Button
              onClick={() => exportPDF('ledger')}
              className="w-full gradient-hero touch-friendly"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Ledger (PDF)
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-soft gradient-card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">CSV Export</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Export all ledger entries to CSV format for Excel/Tally import
            </p>
            <Button
              onClick={exportCSV}
              variant="outline"
              className="w-full touch-friendly"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
