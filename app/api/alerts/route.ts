import { NextResponse } from 'next/server';
import type { Alert } from '@/types/alerts-types';

// In-memory array to simulate a database
let alerts: Alert[] = [
    {
        id: 'alert_1',
        symbol: 'AAPL',
        type: 'price',
        condition: 'above',
        value: 180,
        status: 'active',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'alert_2',
        symbol: 'TSLA',
        type: 'percent_change',
        condition: 'below',
        value: -5, // Represents a 5% drop
        status: 'active',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'alert_3',
        symbol: 'NVDA',
        type: 'volume',
        condition: 'above',
        value: 50000000, // 50 million shares
        status: 'triggered',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        triggeredAt: new Date().toISOString(),
    },
];

// GET all alerts
export async function GET() {
  return NextResponse.json({ success: true, data: alerts });
}

// POST a new alert
export async function POST(request: Request) {
  try {
    const alertData = await request.json();
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    alerts.push(newAlert);
    return NextResponse.json({ success: true, data: newAlert }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}

// PUT (update) an alert
export async function PUT(request: Request) {
    try {
        const updatedAlert: Alert = await request.json();
        const index = alerts.findIndex(a => a.id === updatedAlert.id);
        if (index === -1) {
            return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
        }
        alerts[index] = updatedAlert;
        return NextResponse.json({ success: true, data: updatedAlert });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }
}

// DELETE an alert
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const initialLength = alerts.length;
        alerts = alerts.filter(a => a.id !== id);
        if (alerts.length === initialLength) {
            return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Alert deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
}