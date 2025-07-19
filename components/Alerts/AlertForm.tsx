"use client"
import { useState, useEffect } from "react";
import { useAlerts } from "@/contexts/alerts-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Alert } from "@/types/alerts-types";
import type { PriceAlert, NewsAlert } from "@/types/alerts-types";
interface AlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  alert?: Alert | null;
}

export function AlertForm({ isOpen, onClose, alert }: AlertFormProps) {
  const { addAlert, updateAlert } = useAlerts();
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<Alert['type']>('price');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (alert) {
      setSymbol(alert.symbol);
      setType(alert.type);
      if (alert.type !== 'news') {
          setCondition(alert.condition);
          setValue(String(alert.value));
      }
    } else {
      setSymbol('');
      setType('price');
      setCondition('above');
      setValue('');
    }
  }, [alert, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!symbol || (type !== 'news' && isNaN(numericValue))) return;

    let alertData: PriceAlert | NewsAlert;

    switch (type) {
      case 'price':
      case 'percent_change':
      case 'volume':
        alertData = {
          symbol: symbol.toUpperCase(),
          type,
          condition,
          value: numericValue, 
        } as PriceAlert; // Type assertion for these cases
        break;
      case 'news':
        alertData = {
          symbol: symbol.toUpperCase(),
          type,
        } as NewsAlert; // Type assertion for news
    };
    
    if (alert) {
      updateAlert({ ...alert, ...alertData });
    } else {
      addAlert(alertData as any);
    }
    onClose(); // Close the form after submission
  };
  
  const renderValueInput = () => {
      switch (type) {
          case 'price':
              return <Input id="value" type="number" placeholder="e.g., 180.50" value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          case 'percent_change':
              return <Input id="value" type="number" placeholder="e.g., 5 for 5%" value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          case 'volume':
              return <Input id="value" type="number" placeholder="e.g., 50000000" value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3 bg-gray-700 border-gray-600" />
          default:
              return null;
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{alert ? 'Edit Alert' : 'Create New Alert'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">Symbol</Label>
              <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Alert Type</Label>
              <Select value={type} onValueChange={(val: Alert['type']) => setType(val)}>
                <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="percent_change">Percentage Change</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="news" disabled>News (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="condition" className="text-right">Condition</Label>
                <Select value={condition} onValueChange={(val: 'above' | 'below') => setCondition(val)}>
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Value</Label>
                {renderValueInput()}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{alert ? 'Save Changes' : 'Create Alert'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}