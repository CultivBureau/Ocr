/**
 * Loading Component Usage Examples
 * 
 * This file demonstrates various ways to use the Loading component
 * throughout the application. Copy and adapt these examples as needed.
 */

"use client";

import { useState } from "react";
import Loading from "./Loading";

// ============================================
// Example 1: Full Page Loading
// ============================================
export function FullPageLoadingExample() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Loading message="Loading page content..." />;
  }

  return <div>Your page content here</div>;
}

// ============================================
// Example 2: Inline Section Loading
// ============================================
export function InlineSectionLoadingExample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/data");
      const result = await response.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-xl font-bold mb-4">Data Section</h2>
      
      {loading ? (
        <Loading 
          fullScreen={false} 
          size="sm" 
          message="Fetching data..." 
        />
      ) : (
        <div>
          {data.map((item: any) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      )}
      
      <button onClick={fetchData} className="mt-4 px-4 py-2 bg-[#A4C639] text-white rounded-lg">
        Refresh Data
      </button>
    </div>
  );
}

// ============================================
// Example 3: Form Submission Loading
// ============================================
export function FormSubmissionLoadingExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show full-screen loading during submission
  if (isSubmitting) {
    return <Loading message="Submitting your form..." size="lg" />;
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl">
      <h2 className="text-xl font-bold mb-4">Submit Form</h2>
      <input 
        type="text" 
        placeholder="Enter data" 
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />
      <button 
        type="submit"
        className="px-6 py-2 bg-[#A4C639] text-white rounded-lg font-semibold"
      >
        Submit
      </button>
    </form>
  );
}

// ============================================
// Example 4: Data Fetching with useEffect
// ============================================
export function DataFetchingExample() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useState(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  });

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Users List</h2>
      {users.map((user: any) => (
        <div key={user.id} className="p-3 border rounded-lg mb-2">
          {user.name}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Example 5: Multiple Size Variants
// ============================================
export function SizeVariantsExample() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Small Size</h3>
        <div className="bg-gray-50 p-6 rounded-xl">
          <Loading fullScreen={false} size="sm" message="Small loading..." />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Medium Size (Default)</h3>
        <div className="bg-gray-50 p-6 rounded-xl">
          <Loading fullScreen={false} size="md" message="Medium loading..." />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Large Size</h3>
        <div className="bg-gray-50 p-6 rounded-xl">
          <Loading fullScreen={false} size="lg" message="Large loading..." />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 6: Button with Loading State
// ============================================
export function ButtonLoadingExample() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      alert("Action completed!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={handleAction}
        disabled={isProcessing}
        className="px-6 py-3 bg-gradient-to-r from-[#A4C639] to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Click to Process"
        )}
      </button>
    </div>
  );
}

// ============================================
// Example 7: Conditional Loading with Timeout
// ============================================
export function TimeoutLoadingExample() {
  const [loading, setLoading] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);

  const startLongProcess = async () => {
    setLoading(true);
    setShowTimeout(false);

    // Set timeout warning after 5 seconds
    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

    try {
      // Simulate long API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearTimeout(timeoutId);
    } finally {
      setLoading(false);
      setShowTimeout(false);
    }
  };

  if (loading) {
    return (
      <Loading 
        message={showTimeout ? "This is taking longer than expected..." : "Processing your request..."} 
      />
    );
  }

  return (
    <div className="p-6">
      <button 
        onClick={startLongProcess}
        className="px-6 py-3 bg-[#A4C639] text-white rounded-xl font-semibold"
      >
        Start Long Process
      </button>
    </div>
  );
}

// ============================================
// Example 8: Navigation Loading
// ============================================
export function NavigationLoadingExample() {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = async (path: string) => {
    setIsNavigating(true);
    
    // Simulate navigation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, use router.push(path)
    console.log(`Navigating to ${path}`);
    
    setIsNavigating(false);
  };

  if (isNavigating) {
    return <Loading message="Navigating..." />;
  }

  return (
    <div className="p-6 space-y-4">
      <button 
        onClick={() => handleNavigation("/dashboard")}
        className="block w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold"
      >
        Go to Dashboard
      </button>
      <button 
        onClick={() => handleNavigation("/profile")}
        className="block w-full px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold"
      >
        Go to Profile
      </button>
    </div>
  );
}

// ============================================
// Example 9: File Upload Loading
// ============================================
export function FileUploadLoadingExample() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`File ${file.name} uploaded successfully!`);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return <Loading message="Uploading file..." size="lg" />;
  }

  return (
    <div className="p-6">
      <label className="block">
        <span className="text-lg font-semibold mb-2 block">Upload File</span>
        <input
          type="file"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#A4C639] file:text-white hover:file:bg-[#8FB02E]"
        />
      </label>
    </div>
  );
}

// ============================================
// Example 10: Refresh Data Loading
// ============================================
export function RefreshDataExample() {
  const [data, setData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchData = async () => {
    if (initialLoad) {
      setInitialLoad(false);
      // Show full-screen loading on initial load
      return <Loading message="Loading data..." />;
    }
    
    // Show inline loading on refresh
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData([{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Data List</h2>
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className="px-4 py-2 bg-[#A4C639] text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isRefreshing ? (
        <Loading fullScreen={false} size="sm" message="Refreshing data..." />
      ) : (
        <div className="space-y-2">
          {data.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

