const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return response.json();
    },

    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    },

    vendorLogin: async (email, password) => {
  const response = await fetch(`${API_URL}/auth/vendor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();

  // 403 = not approved yet — return data so frontend can show the right message
  if (response.status === 403) {
    return data;  // ← let handleLoginSubmit handle isApproved: false
  }

  // 401 = wrong credentials — throw so catch block shows error
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
},

    vendorRegister: async (registerData) => {
      const response = await fetch(`${API_URL}/auth/vendor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      return response.json();
    }
  },

  // Helper to get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  // Admin endpoints
  admin: {
    // ── Vendors ──────────────────────────────────────────────────────────────
    getVendors: async () => {
      const response = await fetch(`${API_URL}/admin/vendors`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    approveVendor: async (vendorId) => {
      const response = await fetch(`${API_URL}/admin/vendors/${vendorId}/approve`, {
        method: 'POST',
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    rejectVendor: async (vendorId) => {
      const response = await fetch(`${API_URL}/admin/vendors/${vendorId}/reject`, {
        method: 'POST',
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    deleteVendor: async (vendorId) => {
      const response = await fetch(`${API_URL}/admin/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getVendorStats: async (vendorId) => {
      const response = await fetch(`${API_URL}/admin/vendors/${vendorId}/stats`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    getUsers: async () => {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },

    // ── Bookings ──────────────────────────────────────────────────────────────
    getBookings: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const response = await fetch(`${API_URL}/admin/bookings?${params}`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getBookingStats: async () => {
      const response = await fetch(`${API_URL}/admin/bookings/stats`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getBookingById: async (id) => {
      const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    updateBooking: async (id, data) => {
      const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
        method: 'PUT',
        headers: api.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return response.json();
    },
    assignVendorToBooking: async (bookingId, vendorId) => {
      const response = await fetch(`${API_URL}/admin/bookings/${bookingId}/assign-vendor`, {
        method: 'PUT',
        headers: api.getAuthHeaders(),
        body: JSON.stringify({ vendor_id: vendorId })
      });
      return response.json();
    },
    getApprovedVendorsList: async () => {
      const response = await fetch(`${API_URL}/admin/bookings/vendors-list`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    // ─── ADD THIS to your api.admin object in lib/api.js ────────────────────────
// Place it alongside your existing admin methods

getVendorStats: async () => {
  const response = await fetch(`${API_URL}/admin/vendors/stats`, {
    headers: api.getAuthHeaders()
  });
  return response.json();
},

// ─── ADD THESE to your api.admin object in lib/api.js ───────────────────────

// Section 4 - Payments (no new endpoints needed, reuses getBookings + updateBooking)
// AdminPaymentsSection uses: api.admin.getBookings(), api.admin.getBookingStats(), api.admin.updateBooking()
// These already exist. No new API methods needed for Section 4.

// Section 5 - Service Categories (NEW)
getCategories: async () => {
  const response = await fetch(`${API_URL}/admin/categories`, {
    headers: api.getAuthHeaders()
  });
  return response.json();
},

createCategory: async (data) => {
  const response = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: api.getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
},

updateCategory: async (id, data) => {
  const response = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: api.getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
},

deleteCategory: async (id) => {
  const response = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: api.getAuthHeaders()
  });
  return response.json();
},

// ─── ADD THESE to your api.admin object in lib/api.js ───────────────────────

// Paste these alongside your existing admin methods:

blockUser: async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
    method: 'PUT',
    headers: api.getAuthHeaders()
  });
  return response.json();
},

unblockUser: async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/unblock`, {
    method: 'PUT',
    headers: api.getAuthHeaders()
  });
  return response.json();
},

deleteUser: async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: api.getAuthHeaders()
  });
  return response.json();
},

resetUserPassword: async (userId, newPassword) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: api.getAuthHeaders(),
    body: JSON.stringify({ newPassword })
  });
  return response.json();
},

// Also rename your existing getBookings to getAllBookings (or add this alias):
getAllBookings: async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const response = await fetch(`${API_URL}/admin/bookings?${params}`, {
    headers: api.getAuthHeaders()
  });
  return response.json();
},
  },

  // Vendor endpoints
  vendor: {
    getProfile: async () => {
      const response = await fetch(`${API_URL}/vendor/profile`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    updateProfile: async (profileData) => {
      const response = await fetch(`${API_URL}/vendor/profile`, {
        method: 'PUT',
        headers: api.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return response.json();
    },
    getBookings: async () => {
      const response = await fetch(`${API_URL}/vendor/bookings`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getReviews: async () => {
      const response = await fetch(`${API_URL}/vendor/reviews`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getServices: async () => {
      const response = await fetch(`${API_URL}/vendor/services`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getStats: async () => {
      const response = await fetch(`${API_URL}/vendor/stats`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    }
  },

  // User endpoints
  user: {
    getProfile: async () => {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getBookings: async () => {
      const response = await fetch(`${API_URL}/user/bookings`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    getFavorites: async () => {
      const response = await fetch(`${API_URL}/user/favorites`, {
        headers: api.getAuthHeaders()
      });
      return response.json();
    },
    addFavorite: async (vendorId) => {
      const response = await fetch(`${API_URL}/user/favorites`, {
        method: 'POST',
        headers: api.getAuthHeaders(),
        body: JSON.stringify({ vendorId })
      });
      return response.json();
    },
    removeFavorite: async (vendorId) => {
      const response = await fetch(`${API_URL}/user/favorites/${vendorId}`, {
        method: 'DELETE',
        headers: api.getAuthHeaders()
      });
      return response.json();
    }
  },

  // Public vendor endpoints
  vendors: {
    getApproved: async () => {
      const response = await fetch(`${API_URL}/vendors/approved`);
      return response.json();
    },
    getById: async (id) => {
      const response = await fetch(`${API_URL}/vendors/${id}`);
      return response.json();
    },
    search: async (query, category, city, state) => {
      const params = new URLSearchParams();
      if (query)    params.append('query', query);
      if (category) params.append('category', category);
      if (city)     params.append('city', city);
      if (state)    params.append('state', state);
      const response = await fetch(`${API_URL}/vendors/search?${params}`);
      return response.json();
    }
  }

  
};