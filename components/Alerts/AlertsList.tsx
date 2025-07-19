"use client"
import { useAlerts } from "@/contexts/alerts-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, BellOff, Bell, Loader2, XCircle } from "lucide-react";
import type { Alert } from "@/types/alerts-types"

interface AlertsListProps {
  onEdit: (alert: Alert) => void;
}

export function AlertsList({ onEdit }: AlertsListProps) {
  const { alerts, deleteAlert, updateAlert, isLoading } = useAlerts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Active</Badge>;
      case 'triggered':
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-500">Triggered</Badge>;
      case 'inactive':
        return <Badge variant="default" className="bg-gray-500 hover:bg-gray-500">Inactive</Badge>;
      case 'error': // This case is added to handle the 'error' status
        return <Badge variant="default" className="bg-red-500 hover:bg-red-500 flex items-center"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="default" className="bg-gray-500 hover:bg-gray-500">{status}</Badge>;
    }
  };
  
  const formatCondition = (alert: Alert) => {
    switch (alert.type) {
        case 'price':
            return `Price ${alert.condition} $${alert.value.toFixed(2)}`;
        case 'percent_change':
            const direction = alert.value > 0 ? 'up' : 'down';
            return `% Change is ${direction} ${Math.abs(alert.value)}%`;
        case 'volume':
            return `Volume is ${alert.condition} ${alert.value.toLocaleString()}`;
        case 'news':
            return `News contains "${alert.keywords.join(', ')}"`;
    }
  }

  const toggleAlertStatus = (alert: Alert) => {
    const newStatus = alert.status === 'active' ? 'inactive' : 'active';
    updateAlert({ ...alert, status: newStatus });
  };
  
  if (isLoading && alerts.length === 0) {
      return <div className="text-center py-12 text-gray-500 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return <div className="text-center py-12 text-gray-500">You have no alerts set up.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-white">Symbol</TableHead>
          <TableHead className="text-white">Condition</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white">Created At</TableHead>
          <TableHead className="text-right text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell className="font-medium text-white">{alert.symbol}</TableCell>
            <TableCell className="text-gray-300">{formatCondition(alert)}</TableCell>
            <TableCell>{getStatusBadge(alert.status)}</TableCell>
            <TableCell className="text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600 text-white">
                  <DropdownMenuItem onClick={() => onEdit(alert)} className="focus:bg-gray-700">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAlertStatus(alert)} className="focus:bg-gray-700">
                    {alert.status === 'active' ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                    {alert.status === 'active' ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteAlert(alert.id)} className="text-red-400 focus:bg-red-900/50 focus:text-red-300">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}