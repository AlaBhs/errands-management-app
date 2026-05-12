import { DollarSign, Clock, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";

export function AnalyticsPage() {
  const costData = [
    { category: "Office Supplies", amount: 15240, percentage: 28, trend: "up", change: 12 },
    { category: "IT Equipment", amount: 23600, percentage: 43, trend: "down", change: -8 },
    { category: "Travel", amount: 8900, percentage: 16, trend: "up", change: 15 },
    { category: "Facilities", amount: 5120, percentage: 9, trend: "down", change: -3 },
    { category: "Other", amount: 2140, percentage: 4, trend: "up", change: 5 },
  ];

  const deadlinePerformance = [
    { month: "Jan", onTime: 92, delayed: 8 },
    { month: "Feb", onTime: 88, delayed: 12 },
    { month: "Mar", onTime: 95, delayed: 5 },
  ];

  const recentCosts = [
    {
      id: "REQ-008",
      title: "Office Furniture Purchase",
      category: "Facilities",
      cost: 2500,
      date: "2026-02-25",
    },
    {
      id: "REQ-007",
      title: "Software License Renewal",
      category: "IT Equipment",
      cost: 4200,
      date: "2026-02-24",
    },
    {
      id: "REQ-006",
      title: "Catering for Team Event",
      category: "Other",
      cost: 850,
      date: "2026-02-23",
    },
    {
      id: "REQ-005",
      title: "Document Translation",
      category: "Office Supplies",
      cost: 320,
      date: "2026-02-22",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#2E2E38] mb-1">Analytics & Reports</h1>
        <p className="text-gray-600">Cost analysis and deadline performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              5.2%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Costs (MTD)</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">$55,000</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              7%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">On-Time Delivery</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">95%</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs text-red-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              4 items
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Delayed Requests</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">5%</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">per request</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Avg Cost</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">$221</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown by Category */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium text-[#2E2E38] mb-4">Cost Breakdown by Category</h2>
          <div className="space-y-4">
            {costData.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#2E2E38]">{item.category}</span>
                    <span className={`text-xs flex items-center gap-1 ${
                      item.trend === "up" ? "text-red-600" : "text-green-600"
                    }`}>
                      {item.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(item.change)}%
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#2E2E38]">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#FFE600] h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Performance */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-medium text-[#2E2E38] mb-4">Deadline Performance (Last 3 Months)</h2>
          <div className="space-y-4">
            {deadlinePerformance.map((month) => (
              <div key={month.month}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#2E2E38]">{month.month} 2026</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-600">On-time: {month.onTime}%</span>
                    <span className="text-red-600">Delayed: {month.delayed}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
                  <div
                    className="bg-green-500 h-3"
                    style={{ width: `${month.onTime}%` }}
                  ></div>
                  <div
                    className="bg-red-500 h-3"
                    style={{ width: `${month.delayed}%` }}
                  ></div>
                </div>
              </div>
            ))}

            {/* Average Stats */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">92%</p>
                  <p className="text-xs text-gray-600 mt-1">Avg On-Time</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">1.2 days</p>
                  <p className="text-xs text-gray-600 mt-1">Avg Lead Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cost Details */}
      <div className="bg-white rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg text-[#2E2E38]">Recent Cost Details</h2>
          <button className="text-sm text-[#2E2E38] hover:text-[#FFE600] transition-colors">
            Export Report →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {recentCosts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2E38]">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2E38]">
                    ${item.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Key Insights</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• IT Equipment costs decreased by 8% compared to last month</li>
              <li>• On-time delivery improved by 7% in March</li>
              <li>• Average request completion time is 1.2 days</li>
              <li>• Office Supplies category shows 12% increase in spending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
