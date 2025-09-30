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
      <h2 className="text-2xl font-bold text-ledger-header">Dashboard</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 gradient-card shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-success mt-1">{formatCurrency(stats.totalSales)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success opacity-50" />
          </div>
        </Card>

        <Card className="p-6 gradient-card shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="text-2xl font-bold text-info mt-1">{formatCurrency(stats.totalPurchases)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-info opacity-50" />
          </div>
        </Card>

        <Card className="p-6 gradient-card shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <Wallet className="w-8 h-8 text-destructive opacity-50" />
          </div>
        </Card>

        <Card className="p-6 gradient-card shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receipts</p>
              <p className="text-2xl font-bold text-accent mt-1">{formatCurrency(stats.totalReceipts)}</p>
            </div>
            <Receipt className="w-8 h-8 text-accent opacity-50" />
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 shadow-medium">
          <h3 className="font-semibold mb-4">Profit & Loss</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium text-success">{formatCurrency(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost of Goods:</span>
              <span className="font-medium text-info">{formatCurrency(stats.totalPurchases)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expenses:</span>
              <span className="font-medium text-destructive">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-bold">Net Profit:</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-medium">
          <h3 className="font-semibold mb-4">GST Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST Collected:</span>
              <span className="font-medium text-success">{formatCurrency(stats.gstCollected)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST Paid:</span>
              <span className="font-medium text-info">{formatCurrency(stats.gstPaid)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-bold">Net GST Liability:</span>
              <span className={`font-bold ${netGST >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netGST)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
