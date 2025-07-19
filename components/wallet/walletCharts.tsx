"use client"
import { useWallet } from "@/contexts/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function WalletCharts() {
    const { analytics } = useWallet();
    if (!analytics) return null;
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-white">Investment Distribution</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={analytics.investmentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {analytics.investmentDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-white">Balance Trend (30 Days)</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analytics.balanceTrend}>
                            <XAxis dataKey="date" stroke="#8884d8"/>
                            <YAxis stroke="#8884d8"/>
                            <Tooltip />
                            <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader><CardTitle className="text-white">Daily P&L (7 Days)</CardTitle></CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics.dailyPLHistory}>
                           <XAxis dataKey="date" stroke="#8884d8"/>
                           <YAxis stroke="#8884d8"/>
                           <Tooltip />
                           <Bar dataKey="pnl">
                               {analytics.dailyPLHistory.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#00C49F' : '#FF8042'}/>
                               ))}
                           </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}