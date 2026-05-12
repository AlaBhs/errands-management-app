import { useState } from "react";
import { UserPlus, Trash2, Edit } from "lucide-react";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "categories">("users");

  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@ey.com",
      role: "Operations Manager",
      department: "Operations",
      status: "Active",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@ey.com",
      role: "IT Coordinator",
      department: "IT",
      status: "Active",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@ey.com",
      role: "Travel Coordinator",
      department: "Operations",
      status: "Active",
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.wilson@ey.com",
      role: "Facilities Manager",
      department: "Facilities",
      status: "Active",
    },
    {
      id: 5,
      name: "Anna Martinez",
      email: "anna.martinez@ey.com",
      role: "HR Coordinator",
      department: "HR",
      status: "Active",
    },
  ];

  const categories = [
    {
      id: 1,
      name: "Office Supplies",
      description: "General office supplies and stationery",
      requestCount: 45,
    },
    {
      id: 2,
      name: "IT Equipment",
      description: "Computers, laptops, and IT accessories",
      requestCount: 32,
    },
    {
      id: 3,
      name: "Travel & Accommodation",
      description: "Business travel and hotel bookings",
      requestCount: 28,
    },
    {
      id: 4,
      name: "Facilities & Maintenance",
      description: "Building maintenance and repairs",
      requestCount: 19,
    },
    {
      id: 5,
      name: "HR & Administration",
      description: "HR-related requests and documentation",
      requestCount: 15,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#2E2E38] mb-1">Admin Panel</h1>
        <p className="text-gray-600">Manage users and system settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-[#FFE600] text-[#2E2E38] font-medium"
                : "border-transparent text-gray-600 hover:text-[#2E2E38]"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "categories"
                ? "border-[#FFE600] text-[#2E2E38] font-medium"
                : "border-transparent text-gray-600 hover:text-[#2E2E38]"
            }`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total Users: <span className="font-medium text-[#2E2E38]">{users.length}</span>
            </p>
            <button className="px-4 py-2 bg-[#2E2E38] text-white rounded-lg hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2E2E38] flex items-center justify-center text-white text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="text-sm font-medium text-[#2E2E38]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total Categories: <span className="font-medium text-[#2E2E38]">{categories.length}</span>
            </p>
            <button className="px-4 py-2 bg-[#2E2E38] text-white rounded-lg hover:bg-[#1a1a24] transition-colors flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-[#2E2E38]">{category.name}</h3>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-gray-500">Total Requests</span>
                  <span className="text-sm font-medium text-[#2E2E38]">{category.requestCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">5</p>
          <p className="text-xs text-green-600 mt-2">All users active</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-sm text-gray-600 mb-1">Total Departments</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">4</p>
          <p className="text-xs text-gray-500 mt-2">Across organization</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-sm text-gray-600 mb-1">Request Categories</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">5</p>
          <p className="text-xs text-gray-500 mt-2">Active categories</p>
        </div>
      </div>
    </div>
  );
}
