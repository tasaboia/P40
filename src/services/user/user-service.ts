import { User } from "@p40/common/contracts/user/user";
import api from "@p40/lib/axios";

export const updateUser = async (prevState: any, formData: FormData) => {
  const name = formData.get("name")?.toString();
  const id = formData.get("id")?.toString();
  const email = formData.get("email")?.toString();
  const whatsapp = formData.get("whatsapp")?.toString();

  try {
    const response = await api.post("/api/user/update", {
      name,
      email,
      whatsapp,
      id,
    });

    if (!response.data.success) {
      throw new Error("Erro ao atualizar usuário.");
    }

    return { success: true, user: response.data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUser = async (
  userId: string
): Promise<{ success: boolean; user?: User | null; error?: string }> => {
  try {
    const response = await api.get(`/api/user?userId=${userId}`);

    if (!response.data.success) {
      throw new Error("Erro ao atualizar usuário.");
    }

    return { success: true, user: response.data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
