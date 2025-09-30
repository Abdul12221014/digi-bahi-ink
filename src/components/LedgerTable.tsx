import { useState, useEffect } from 'react';
import { db, LedgerEntry } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/gst';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface LedgerTableProps {
  onAddEntry: () => void;
  refresh: number;
}

export function LedgerTable({ onAddEntry, refresh }: LedgerTableProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [refresh]);

  async function loadEntries() {
    try {
      const allEntries = await db.ledger.orderBy('date').reverse().toArray();
      setEntries(allEntries);
    } catch (error) {
      toast.error('Failed to load ledger entries');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number | undefined) {
    if (!id) return;
    
    if (confirm('Delete this entry?')) {
      try {
        await db.ledger.delete(id);
        await loadEntries();
        toast.success('Entry deleted');
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-success/10 text-success';
      case 'purchase': return 'bg-info/10 text-info';
      case 'expense': return 'bg-destructive/10 text-destructive';
      case 'receipt': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading ledger...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
          Ledger Entries
        </h2>
        <Button onClick={onAddEntry} className="gradient-hero touch-friendly hover-glow hover-scale">
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="p-8 text-center gradient-card shadow-medium animate-scale-in">
          <p className="text-muted-foreground mb-4">No entries yet. Create your first transaction!</p>
          <Button onClick={onAddEntry} variant="outline" className="hover-lift">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </Card>
      ) : (
        <div className="border rounded-lg shadow-medium overflow-hidden ledger-paper animate-slide-in">
          <Table>
            <TableHeader>
              <TableRow className="ledger-line bg-gradient-to-r from-[hsl(145_70%_32%_/_0.05)] to-[hsl(40_98%_48%_/_0.05)]">
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="text-right font-bold">Amount</TableHead>
                <TableHead className="text-right font-bold">GST</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow 
                  key={entry.id} 
                  className="ledger-line hover:bg-gradient-to-r hover:from-[hsl(145_70%_32%_/_0.03)] hover:to-[hsl(40_98%_48%_/_0.03)] transition-smooth"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell className="font-medium">{entry.description}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(entry.type)}>
                      {entry.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                  <TableCell className="text-right text-sm">
                    {entry.gstRate > 0 ? `${formatCurrency(entry.gstAmount)} (${entry.gstRate}%)` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(entry.amount + entry.gstAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="touch-friendly hover-scale">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        className="touch-friendly text-destructive hover:text-destructive hover-scale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
