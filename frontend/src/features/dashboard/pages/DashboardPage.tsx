import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router";

export function DashboardPage() {
  const stats = [
    {
      title: "Total Requests",
      value: "248",
      icon: FileText,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending",
      value: "45",
      icon: Clock,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Completed",
      value: "189",
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "High Priority",
      value: "12",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  const recentRequests = [
    {
      id: "REQ-001",
      title: "Office Supplies Procurement",
      status: "Pending",
      priority: "Medium",
      createdDate: "2026-02-24",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "REQ-002",
      title: "IT Equipment Request",
      status: "In Progress",
      priority: "High",
      createdDate: "2026-02-23",
      assignedTo: "Michael Chen",
    },
    {
      id: "REQ-003",
      title: "Travel Arrangement - Client Meeting",
      status: "Completed",
      priority: "High",
      createdDate: "2026-02-22",
      assignedTo: "Emily Davis",
    },
    {
      id: "REQ-004",
      title: "Conference Room Booking",
      status: "Pending",
      priority: "Low",
      createdDate: "2026-02-21",
      assignedTo: "James Wilson",
    },
    {
      id: "REQ-005",
      title: "Document Translation Service",
      status: "In Progress",
      priority: "Medium",
      createdDate: "2026-02-20",
      assignedTo: "Anna Martinez",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#2E2E38] mb-1">Dashboard</h1>
        <p className="text-gray-600">Welcome back, here's an overview of your errands</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-semibold text-[#2E2E38]">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg text-[#2E2E38]">Recent Requests</h2>
          <Link
            to="/requests"
            className="text-sm text-[#2E2E38] hover:text-[#FFE600] transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {recentRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2E38]">
                    {request.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {request.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {request.createdDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {request.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/requests/${request.id}`}
                      className="text-[#2E2E38] hover:text-[#FFE600] font-medium transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
