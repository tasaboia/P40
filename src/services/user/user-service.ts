import api from "@p40/lib/axios";

export const updateUser = async (prevState: any, formData: FormData) => {
  const name = formData.get("name")?.toString();
  const id = formData.get("id")?.toString();
  const email = formData.get("email")?.toString();
  const whatsapp = formData.get("whatsapp")?.toString();

  try {
    const response = await api.post(
      "/api/user/update",

      { name, email, whatsapp, id }
    );

    return { success: true, user: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
