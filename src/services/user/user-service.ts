export const updateUser = async (userData: {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
}) => {
  try {
    const response = await fetch("/api/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update user");

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
