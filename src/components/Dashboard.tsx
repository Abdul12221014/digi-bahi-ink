import { useState, useEffect } from 'react';
import { db, LedgerEntry } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/gst';
import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalReceipts: 0,
    gstCollected: 0,
    gstPaid: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const entries = await db.ledger.toArray();
    
    const stats = entries.reduce((acc, entry) => {
      const total = entry.amount + entry.gstAmount;
      
      switch (entry.type) {
        case 'sale':
          acc.totalSales += total;
          acc.gstCollected += entry.gstAmount;
          break;
        case 'purchase':
          acc.totalPurchases += total;
          acc.gstPaid += entry.gstAmount;
          break;
        case 'expense':
          acc.totalExpenses += total;
          break;
        case 'receipt':
          acc.totalReceipts += total;
          break;
      }
      
      return acc;
    }, {
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      totalReceipts: 0,
      gstCollected: 0,
      gstPaid: 0
    });

    setStats(stats);
  }

  const netProfit = stats.totalSales - stats.totalPurchases - stats.totalExpenses;
  const netGST = stats.gstCollected - stats.gstPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent animate-slide-in">
          Dashboard
        </h2>
        <div className="animate-fade-in">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 card-gradient shadow-medium hover-lift border-l-4 border-l-[hsl(145_75%_38%)] animate-scale-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Sales</p>
              <p className="text-3xl font-bold bg-gradient-to-br from-[hsl(145_75%_38%)] to-[hsl(145_70%_32%)] bg-clip-text text-transparent mt-2">
                {formatCurrency(stats.totalSales)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(145_75%_38%)]/10">
              <TrendingUp className="w-6 h-6 text-[hsl(145_75%_38%)]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-gradient shadow-medium hover-lift border-l-4 border-l-[hsl(200_75%_48%)] animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Purchases</p>
              <p className="text-3xl font-bold bg-gradient-to-br from-[hsl(200_75%_48%)] to-[hsl(200_65%_40%)] bg-clip-text text-transparent mt-2">
                {formatCurrency(stats.totalPurchases)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(200_75%_48%)]/10">
              <TrendingDown className="w-6 h-6 text-[hsl(200_75%_48%)]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-gradient shadow-medium hover-lift border-l-4 border-l-[hsl(0_75%_52%)] animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Expenses</p>
              <p className="text-3xl font-bold bg-gradient-to-br from-[hsl(0_75%_52%)] to-[hsl(0_65%_44%)] bg-clip-text text-transparent mt-2">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(0_75%_52%)]/10">
              <Wallet className="w-6 h-6 text-[hsl(0_75%_52%)]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-gradient shadow-medium hover-lift border-l-4 border-l-[hsl(40_98%_48%)] animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Receipts</p>
              <p className="text-3xl font-bold bg-gradient-to-br from-[hsl(40_98%_48%)] to-[hsl(45_95%_50%)] bg-clip-text text-transparent mt-2">
                {formatCurrency(stats.totalReceipts)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(40_98%_48%)]/10">
              <Receipt className="w-6 h-6 text-[hsl(40_98%_48%)]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-strong hover-lift card-gradient animate-fade-in border-t-4 border-t-primary">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] rounded-full"></div>
            Profit & Loss
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(145_75%_38%)]/5 hover:bg-[hsl(145_75%_38%)]/10 transition-smooth">
              <span className="text-sm font-medium text-muted-foreground">Revenue</span>
              <span className="font-bold text-[hsl(145_75%_38%)]">{formatCurrency(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(200_75%_48%)]/5 hover:bg-[hsl(200_75%_48%)]/10 transition-smooth">
              <span className="text-sm font-medium text-muted-foreground">Cost of Goods</span>
              <span className="font-bold text-[hsl(200_75%_48%)]">{formatCurrency(stats.totalPurchases)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(0_75%_52%)]/5 hover:bg-[hsl(0_75%_52%)]/10 transition-smooth">
              <span className="text-sm font-medium text-muted-foreground">Expenses</span>
              <span className="font-bold text-[hsl(0_75%_52%)]">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl gradient-hero mt-4">
              <span className="font-bold text-white text-lg">Net Profit</span>
              <span className="font-bold text-white text-xl">
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-strong hover-lift card-gradient animate-fade-in border-t-4 border-t-[hsl(40_98%_48%)]" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-[hsl(40_98%_48%)] to-[hsl(145_70%_32%)] rounded-full"></div>
            GST Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(145_75%_38%)]/5 hover:bg-[hsl(145_75%_38%)]/10 transition-smooth">
              <span className="text-sm font-medium text-muted-foreground">GST Collected</span>
              <span className="font-bold text-[hsl(145_75%_38%)]">{formatCurrency(stats.gstCollected)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(200_75%_48%)]/5 hover:bg-[hsl(200_75%_48%)]/10 transition-smooth">
              <span className="text-sm font-medium text-muted-foreground">GST Paid</span>
              <span className="font-bold text-[hsl(200_75%_48%)]">{formatCurrency(stats.gstPaid)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[hsl(40_98%_48%)] to-[hsl(45_95%_50%)] mt-4">
              <span className="font-bold text-white text-lg">Net GST Liability</span>
              <span className="font-bold text-white text-xl">
                {formatCurrency(netGST)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
