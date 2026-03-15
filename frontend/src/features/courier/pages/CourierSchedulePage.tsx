import { useState } from "react";
import { Calendar, MapPin, Clock, Upload, CheckCircle } from "lucide-react";

interface Errand {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Assigned" | "In Progress" | "Completed";
  location: string;
  dueDate: string;
  dueTime: string;
  description: string;
}

export function CourierSchedulePage() {
  const [selectedErrand, setSelectedErrand] = useState<Errand | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const assignedErrands: Errand[] = [
    {
      id: "REQ-002",
      title: "IT Equipment Request",
      category: "IT Equipment",
      priority: "High",
      status: "In Progress",
      location: "Building A, Floor 3, Room 305",
      dueDate: "2026-02-26",
      dueTime: "14:00",
      description: "Deliver new laptop and accessories to the IT department",
    },
    {
      id: "REQ-005",
      title: "Document Translation Service",
      category: "Administrative",
      priority: "Medium",
      status: "Assigned",
      location: "Building B, Floor 1, Reception",
      dueDate: "2026-02-26",
      dueTime: "16:30",
      description: "Pick up documents for translation",
    },
    {
      id: "REQ-007",
      title: "Office Furniture Purchase",
      category: "Facilities",
      priority: "Medium",
      status: "Assigned",
      location: "External - Office Depot Store",
      dueDate: "2026-02-27",
      dueTime: "10:00",
      description: "Purchase and deliver ergonomic chairs",
    },
  ];

  const completedErrands: Errand[] = [
    {
      id: "REQ-003",
      title: "Travel Arrangement",
      category: "Travel",
      priority: "High",
      status: "Completed",
      location: "Travel Agency - Downtown",
      dueDate: "2026-02-25",
      dueTime: "11:00",
      description: "Booked flight tickets for client meeting",
    },
  ];

  const handleStatusUpdate = (errandId: string, newStatus: "In Progress" | "Completed") => {
    if (newStatus === "Completed") {
      setProofModalOpen(true);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Assigned":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#2E2E38] mb-1">My Schedule</h1>
        <p className="text-gray-600">View and manage your assigned errands</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Errands</p>
              <p className="text-3xl font-semibold text-[#2E2E38]">
                {assignedErrands.filter(e => e.dueDate === "2026-02-26").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-semibold text-[#2E2E38]">
                {assignedErrands.filter(e => e.status === "In Progress").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Today</p>
              <p className="text-3xl font-semibold text-[#2E2E38]">{completedErrands.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Errands */}
      <div className="bg-white rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg text-[#2E2E38]">Assigned Errands</h2>
        </div>
        <div className="divide-y divide-border">
          {assignedErrands.map((errand) => (
            <div key={errand.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-[#2E2E38]">{errand.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(errand.status)}`}>
                      {errand.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(errand.priority)}`}>
                      {errand.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{errand.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{errand.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{errand.dueDate} at {errand.dueTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {errand.status === "Assigned" && (
                    <button
                      onClick={() => handleStatusUpdate(errand.id, "In Progress")}
                      className="px-4 py-2 bg-[#2E2E38] text-white rounded-lg hover:bg-[#1a1a24] transition-colors whitespace-nowrap"
                    >
                      Start Errand
                    </button>
                  )}
                  {errand.status === "In Progress" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedErrand(errand);
                          setProofModalOpen(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        Mark Complete
                      </button>
                      <button className="px-4 py-2 border border-border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        View Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Errands */}
      <div className="bg-white rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg text-[#2E2E38]">Completed Errands</h2>
        </div>
        <div className="divide-y divide-border">
          {completedErrands.map((errand) => (
            <div key={errand.id} className="p-6 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-[#2E2E38]">{errand.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(errand.status)}`}>
                      {errand.status}
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{errand.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{errand.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Completed on {errand.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof Upload Modal */}
      {proofModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setProofModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-[#2E2E38]">Submit Proof of Completion</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedErrand?.id}: {selectedErrand?.title}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2E2E38] mb-2">
                    Upload Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[#2E2E38] transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-[#2E2E38] font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG (max. 5MB)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2E2E38] mb-2">
                    Completion Notes
                  </label>
                  <textarea
                    placeholder="Add any relevant notes about the completion..."
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E2E38] resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                <button
                  onClick={() => setProofModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Errand marked as completed!");
                    setProofModalOpen(false);
                    setSelectedErrand(null);
                  }}
                  className="px-6 py-2 bg-[#2E2E38] text-white rounded-lg hover:bg-[#1a1a24] transition-colors"
                >
                  Submit & Complete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
