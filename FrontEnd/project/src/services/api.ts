// API configuration and endpoints
// Update this file when adding new API endpoints or changing the API structure
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000', // Replace with actual API URL
  endpoints: {
    query: '/query',
  },
};

export async function sendMessage(message: string) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: message }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function sendFile(file: File, uploadType: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadType", uploadType); // Include upload type

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/process_files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("File Upload Error:", error);
    throw error;
  }
}