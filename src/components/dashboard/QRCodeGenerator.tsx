import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Download, 
  Copy, 
  Share2, 
  Plus, 
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QRCodeGenerator = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState([
    { id: 1, name: 'Table 1', qrGenerated: true, lastUsed: '2 hours ago' },
    { id: 2, name: 'Table 2', qrGenerated: true, lastUsed: '1 hour ago' },
    { id: 3, name: 'Table 3', qrGenerated: false, lastUsed: 'Never' },
    { id: 4, name: 'Table 4', qrGenerated: false, lastUsed: 'Never' },
    { id: 5, name: 'Table 5', qrGenerated: true, lastUsed: '30 min ago' },
  ]);
  const [newTableName, setNewTableName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async (tableId: number) => {
    setIsGenerating(true);
    
    // Simulate QR generation
    setTimeout(() => {
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, qrGenerated: true, lastUsed: 'Just now' }
          : table
      ));
      
      toast({
        title: "QR Code Generated!",
        description: `QR code for Table ${tableId} has been created successfully.`,
      });
      
      setIsGenerating(false);
    }, 1500);
  };

  const downloadQRCode = (tableId: number) => {
    // Create a canvas to generate QR code image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    if (ctx) {
      // Simple QR-like pattern
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(i * 20, j * 20, 20, 20);
          }
        }
      }
      
      // Add table info
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Table ${tableId}`, 150, 280);
      
      // Download
      const link = document.createElement('a');
      link.download = `table-${tableId}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    }

    toast({
      title: "QR Code Downloaded",
      description: `QR code for Table ${tableId} has been saved to your device.`,
    });
  };

  const copyQRLink = (tableId: number) => {
    const url = `${window.location.origin}/menu/demo?table=${tableId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied",
      description: "QR code link has been copied to clipboard.",
    });
  };

  const addNewTable = () => {
    if (newTableName.trim()) {
      const newTable = {
        id: Math.max(...tables.map(t => t.id)) + 1,
        name: newTableName.trim(),
        qrGenerated: false,
        lastUsed: 'Never'
      };
      setTables(prev => [...prev, newTable]);
      setNewTableName('');
      
      toast({
        title: "Table Added",
        description: `${newTableName} has been added successfully.`,
      });
    }
  };

  const deleteTable = (tableId: number) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
    toast({
      title: "Table Removed",
      description: "Table has been deleted successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-6 w-6 mr-2" />
            QR Code Management
          </CardTitle>
          <CardDescription>
            Generate and manage QR codes for your tables. Customers can scan these to access your menu directly.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add New Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Add New Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                placeholder="e.g., Table 6, VIP Table, Outdoor 1"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addNewTable}
                disabled={!newTableName.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{table.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {table.qrGenerated ? (
                    <Badge className="bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Not Generated
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTable(table.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Last used: {table.lastUsed}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {table.qrGenerated ? (
                <div className="space-y-2">
                  {/* QR Code Preview */}
                  <div className="bg-white border-2 border-border rounded-lg p-4 flex items-center justify-center">
                    <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-primary-foreground" />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQRCode(table.id)}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyQRLink(table.id)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                  </div>
                  
                  <Button
                    variant="accent"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`/menu/demo?table=${table.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
                    <QrCode className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No QR code generated</p>
                  </div>
                  
                  <Button
                    onClick={() => generateQRCode(table.id)}
                    disabled={isGenerating}
                    className="w-full"
                    variant="accent"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-accent-foreground border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="shadow-soft bg-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-accent">
            <Settings className="h-5 w-5 mr-2" />
            QR Code Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">📱 Size Recommendations</h4>
              <p className="text-muted-foreground">Print QR codes at least 2x2 inches for easy scanning</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">🖨️ Printing Tips</h4>
              <p className="text-muted-foreground">Use high contrast and avoid glossy surfaces</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">📍 Placement</h4>
              <p className="text-muted-foreground">Place QR codes at eye level on tables</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">🔗 Testing</h4>
              <p className="text-muted-foreground">Always test QR codes before printing in bulk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};